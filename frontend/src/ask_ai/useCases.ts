import { ApiError, NetworkError } from '../lib/api'
import {
  createAskAiMessageApi,
  fetchLatestAskAiMessageApi,
  resetAskAiSessionApi,
  type AskAiMessageAcceptedDto,
  type AskAiMessagePollDto,
  type AskAiSessionDto,
} from './api'

export const MAX_MESSAGE_LENGTH = 4000

export class AskAiSessionConflictError extends Error {
  status: number

  constructor(message = 'Sesja AskAI jest nieaktualna') {
    super(message)
    this.name = 'AskAiSessionConflictError'
    this.status = 409
  }
}

function mapAskAiError(error: unknown): Error {
  if (error instanceof NetworkError) {
    return new Error('Brak połączenia z serwerem AskAI')
  }

  if (error instanceof ApiError) {
    if (error.status === 409) {
      return new AskAiSessionConflictError(
        error.message || 'Sesja AskAI jest nieaktualna. Zresetuj sesję i spróbuj ponownie.',
      )
    }

    if (error.status === 400 || error.status === 422) {
      return new Error('Nieprawidłowe dane zapytania do AskAI')
    }

    if (error.status === 401 || error.status === 403) {
      return new Error('Musisz być zalogowany, aby użyć AskAI')
    }

    return new Error(error.message || 'AskAI jest chwilowo niedostępne')
  }

  return error instanceof Error ? error : new Error('AskAI jest chwilowo niedostępne')
}

export async function resetAskAiSessionUseCase(): Promise<AskAiSessionDto> {
  try {
    return await resetAskAiSessionApi()
  } catch (error) {
    throw mapAskAiError(error)
  }
}

export async function createAskAiMessageUseCase(sessionId: string, message: string): Promise<AskAiMessageAcceptedDto> {
  const normalizedMessage = message.trim()

  if (!normalizedMessage) {
    throw new Error('Wpisz wiadomość do AskAI')
  }

  if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error('Wiadomosc do AskAI nie moze przekroczyc 4000 znakow')
  }

  try {
    return await createAskAiMessageApi({
      sessionId,
      message: normalizedMessage,
    })
  } catch (error) {
    throw mapAskAiError(error)
  }
}

export async function getLatestAskAiMessageUseCase(sessionId: string): Promise<AskAiMessagePollDto> {
  try {
    return await fetchLatestAskAiMessageApi(sessionId)
  } catch (error) {
    throw mapAskAiError(error)
  }
}