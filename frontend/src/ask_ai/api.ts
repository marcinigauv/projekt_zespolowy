import { apiRequest } from '../lib/api'

export type AskAiMessageStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'blocked'
  | 'error'
  | 'session_reset'

export interface AskAiSessionDto {
  sessionId: string
  expiresAt: string
  primaryProvider: string
  fallbackProvider?: string | null
}

export interface AskAiMessageAcceptedDto {
  sessionId: string
  messageId: string
  status: AskAiMessageStatus
  activeThemeSnapshot: string
  toneProfile: string
}

export interface AskAiSuggestedProductDto {
  id: number
  name: string
  description: string
  price: number
  amount: number
  categories: string[]
  imageUrl?: string | null
  productPath: string
}

export interface AskAiTranscriptEntryDto {
  messageId: string
  userMessage: string
  assistantResponse: string
  status: AskAiMessageStatus
  createdAt: string
  updatedAt: string
  suggestedProducts: AskAiSuggestedProductDto[]
}

export interface AskAiMessagePollDto {
  sessionId: string
  messageId?: string | null
  status: AskAiMessageStatus
  partialResponse: string
  finalResponse?: string | null
  activeThemeSnapshot?: string | null
  toneProfile?: string | null
  selectedProvider?: string | null
  failoverReason?: string | null
  errorCode?: string | null
  lastErrorClass?: string | null
  suggestedProducts: AskAiSuggestedProductDto[]
  transcript: AskAiTranscriptEntryDto[]
}

export interface AskAiCreateMessageDto {
  sessionId: string
  message: string
}

export async function resetAskAiSessionApi(): Promise<AskAiSessionDto> {
  return apiRequest<AskAiSessionDto>('/ask-ai/session/reset', {
    method: 'POST',
  })
}

export async function createAskAiMessageApi(payload: AskAiCreateMessageDto): Promise<AskAiMessageAcceptedDto> {
  return apiRequest<AskAiMessageAcceptedDto>('/ask-ai/messages', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchLatestAskAiMessageApi(sessionId: string): Promise<AskAiMessagePollDto> {
  return apiRequest<AskAiMessagePollDto>(`/ask-ai/messages/latest?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
  })
}