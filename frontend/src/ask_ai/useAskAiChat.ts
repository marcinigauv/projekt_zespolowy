import { useCallback, useEffect, useRef, useState } from 'react'
import type { AskAiMessagePollDto, AskAiMessageStatus } from './api'
import {
  createAskAiMessageUseCase,
  getLatestAskAiMessageUseCase,
  MAX_MESSAGE_LENGTH,
  resetAskAiSessionUseCase,
} from './useCases'

const POLLING_INTERVAL_MS = 1200

function isTerminalStatus(status: AskAiMessageStatus): boolean {
  return status === 'completed' || status === 'blocked' || status === 'error' || status === 'session_reset'
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
    setLatestMessage((previousMessage) => ({
      sessionId: activeSessionId,
      messageId: optimisticMessageId,
      status: 'pending',
      partialResponse: '',
      finalResponse: null,
      suggestedProducts: [],
      transcript: [
        ...(previousMessage?.transcript ?? []),
        {
          messageId: optimisticMessageId,
          userMessage: normalizedDraft,
          assistantResponse: '',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          suggestedProducts: [],
        },
      ],
    }))

    try {
      await createAskAiMessageUseCase(activeSessionId, normalizedDraft)
      setDraft('')
      await pollLatestMessage(activeSessionId)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się wysłać wiadomości do AskAI')
      setIsSubmitting(false)
    }
  }, [clearPolling, draft, enabled, initializeSession, isSubmitting, pollLatestMessage, sessionId])

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