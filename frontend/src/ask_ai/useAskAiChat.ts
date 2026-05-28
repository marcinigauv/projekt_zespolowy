import { useCallback, useEffect, useRef, useState } from 'react'
import type { AskAiMessagePollDto, AskAiMessageStatus } from './api'
import {
  AskAiSessionConflictError,
  createAskAiMessageUseCase,
  getLatestAskAiMessageUseCase,
  MAX_MESSAGE_LENGTH,
  resetAskAiSessionUseCase,
} from './useCases'

const POLLING_INTERVAL_MS = 1200
const STALE_SESSION_ERROR_MESSAGE = 'Ta rozmowa jest już nieaktualna. Otwórz nową sesję AskAI i spróbuj ponownie.'

function hasAssistantResponse(transcript: AskAiMessagePollDto['transcript']): boolean {
  return transcript.some((entry) => entry.assistantResponse.trim().length > 0)
}

function isAlmostEmptyConversation(transcript: AskAiMessagePollDto['transcript']): boolean {
  if (transcript.length !== 1) {
    return false
  }

  const [entry] = transcript
  return entry.userMessage.trim().length > 0 && entry.assistantResponse.trim().length === 0
}

function isTerminalStatus(status: AskAiMessageStatus): boolean {
  return status === 'completed' || status === 'blocked' || status === 'error' || status === 'session_reset'
}

function markMessageAsSessionReset(message: AskAiMessagePollDto | null): AskAiMessagePollDto | null {
  if (!message) {
    return message
  }

  const timestamp = new Date().toISOString()

  return {
    ...message,
    status: 'session_reset',
    transcript: message.transcript.map((entry) => {
      if (entry.status !== 'pending' && entry.status !== 'running') {
        return entry
      }

      return {
        ...entry,
        status: 'session_reset',
        updatedAt: timestamp,
      }
    }),
  }
}

export interface AskAiChatController {
  sessionId: string
  draft: string
  transcript: AskAiMessagePollDto['transcript']
  latestMessage: AskAiMessagePollDto | null
  isInitializing: boolean
  isSubmitting: boolean
  error: string
  maxMessageLength: number
  characterCount: number
  remainingCharacters: number
  canSubmit: boolean
  setDraft: (value: string) => void
  initializeSession: () => Promise<string | null>
  submitMessage: () => Promise<void>
}

interface UseAskAiChatOptions {
  enabled: boolean
  autoInitialize?: boolean
}

export function useAskAiChat({ enabled, autoInitialize = false }: UseAskAiChatOptions): AskAiChatController {
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [draft, setDraft] = useState('')
  const [latestMessage, setLatestMessage] = useState<AskAiMessagePollDto | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const clearPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
  }, [])

  const pollLatestMessage = useCallback(async (activeSessionId: string) => {
    try {
      const response = await getLatestAskAiMessageUseCase(activeSessionId)
      setLatestMessage(response)

      if (!isTerminalStatus(response.status)) {
        pollingTimeoutRef.current = setTimeout(() => {
          void pollLatestMessage(activeSessionId)
        }, POLLING_INTERVAL_MS)
      }
    } catch (caughtError) {
      if (caughtError instanceof AskAiSessionConflictError) {
        setLatestMessage((previousMessage) => markMessageAsSessionReset(previousMessage))
        setError(STALE_SESSION_ERROR_MESSAGE)
        setIsSubmitting(false)
        return
      }

      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się pobrać odpowiedzi AskAI')
      setIsSubmitting(false)
    }
  }, [])

  const initializeSession = useCallback(async (): Promise<string | null> => {
    if (!enabled) {
      return null
    }

    clearPolling()
    setIsInitializing(true)
    setIsSubmitting(false)
    setError('')
    setLatestMessage(null)
    setDraft('')

    try {
      const response = await resetAskAiSessionUseCase()
      setSessionId(response.sessionId)
      return response.sessionId
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się uruchomić AskAI')
      setSessionId('')
      return null
    } finally {
      setIsInitializing(false)
    }
  }, [clearPolling, enabled])

  useEffect(() => {
    if (!enabled) {
      clearPolling()
      setSessionId('')
      setDraft('')
      setLatestMessage(null)
      setIsInitializing(false)
      setIsSubmitting(false)
      setError('')
    }
  }, [clearPolling, enabled])

  useEffect(() => {
    if (!enabled || !autoInitialize) {
      return
    }

    void initializeSession()
  }, [autoInitialize, enabled, initializeSession])

  useEffect(() => {
    return () => {
      clearPolling()
    }
  }, [clearPolling])

  useEffect(() => {
    if (!latestMessage) {
      return
    }

    if (isTerminalStatus(latestMessage.status)) {
      setIsSubmitting(false)
    }
  }, [latestMessage])

  const submitMessage = useCallback(async () => {
    const normalizedDraft = draft.trim()

    if (!enabled || !normalizedDraft || isSubmitting) {
      return
    }

    const activeSessionId = sessionId || await initializeSession()
    if (!activeSessionId) {
      return
    }

    clearPolling()
    setError('')
    setIsSubmitting(true)
    const optimisticMessageId = `pending-${Date.now()}`
    const optimisticTimestamp = new Date().toISOString()
    const previousTranscript = latestMessage?.transcript ?? []
    const optimisticTranscriptEntry: AskAiMessagePollDto['transcript'][number] = {
      messageId: optimisticMessageId,
      userMessage: normalizedDraft,
      assistantResponse: '',
      status: 'pending',
      createdAt: optimisticTimestamp,
      updatedAt: optimisticTimestamp,
      suggestedProducts: [],
    }
    const optimisticTranscript = [...previousTranscript, optimisticTranscriptEntry]
    setLatestMessage((previousMessage) => ({
      sessionId: activeSessionId,
      messageId: optimisticMessageId,
      status: 'pending',
      partialResponse: '',
      finalResponse: null,
      suggestedProducts: [],
      transcript: optimisticTranscript,
    }))

    try {
      await createAskAiMessageUseCase(activeSessionId, normalizedDraft)
      setDraft('')
      await pollLatestMessage(activeSessionId)
    } catch (caughtError) {
      if (caughtError instanceof AskAiSessionConflictError) {
        const shouldRetryAfterRefresh = isAlmostEmptyConversation(optimisticTranscript) && !hasAssistantResponse(previousTranscript)

        if (shouldRetryAfterRefresh) {
          const refreshedSessionId = await initializeSession()

          if (!refreshedSessionId) {
            setError('Nie udało się odświeżyć sesji AskAI. Spróbuj ponownie.')
            setIsSubmitting(false)
            return
          }

          setIsSubmitting(true)
          const retryMessageId = `pending-${Date.now()}-retry`
          const retryTimestamp = new Date().toISOString()
          const retryOptimisticEntry: AskAiMessagePollDto['transcript'][number] = {
            messageId: retryMessageId,
            userMessage: normalizedDraft,
            assistantResponse: '',
            status: 'pending',
            createdAt: retryTimestamp,
            updatedAt: retryTimestamp,
            suggestedProducts: [],
          }

          setLatestMessage({
            sessionId: refreshedSessionId,
            messageId: retryMessageId,
            status: 'pending',
            partialResponse: '',
            finalResponse: null,
            suggestedProducts: [],
            transcript: [retryOptimisticEntry],
          })

          try {
            await createAskAiMessageUseCase(refreshedSessionId, normalizedDraft)
            setDraft('')
            await pollLatestMessage(refreshedSessionId)
            return
          } catch (retryError) {
            if (retryError instanceof AskAiSessionConflictError) {
              setLatestMessage((previousMessage) => markMessageAsSessionReset(previousMessage))
              setError(STALE_SESSION_ERROR_MESSAGE)
            } else {
              setError(retryError instanceof Error ? retryError.message : 'Nie udało się wysłać wiadomości do AskAI')
            }
            setIsSubmitting(false)
            return
          }
        }

        setLatestMessage((previousMessage) => markMessageAsSessionReset(previousMessage))
        setError(STALE_SESSION_ERROR_MESSAGE)
        setIsSubmitting(false)
        return
      }

      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się wysłać wiadomości do AskAI')
      setIsSubmitting(false)
    }
  }, [clearPolling, draft, enabled, initializeSession, isSubmitting, latestMessage?.transcript, pollLatestMessage, sessionId])

  return {
    sessionId,
    draft,
    transcript: latestMessage?.transcript ?? [],
    latestMessage,
    isInitializing,
    isSubmitting,
    error,
    maxMessageLength: MAX_MESSAGE_LENGTH,
    characterCount: draft.length,
    remainingCharacters: MAX_MESSAGE_LENGTH - draft.length,
    canSubmit: Boolean(draft.trim()) && !isSubmitting && !isInitializing && draft.length <= MAX_MESSAGE_LENGTH,
    setDraft,
    initializeSession,
    submitMessage,
  }
}