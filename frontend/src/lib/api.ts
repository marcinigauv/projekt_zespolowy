import Constants from 'expo-constants'
import { Platform } from 'react-native'

function normalizeApiBaseUrl(value: string | undefined): string | null {
  if (!value) {
    return null
  }

  const normalizedValue = value.trim().replace(/\/$/, '')
  return normalizedValue.length > 0 ? normalizedValue : null
}

function resolveApiBaseUrl(): string {
  const configuredApiBaseUrl = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL)

  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000`
  }

  const expoConfig = Constants.expoConfig as { hostUri?: string } | null
  const hostUri = expoConfig?.hostUri

  if (hostUri) {
    return `http://${hostUri.split(':')[0]}:8000`
  }

  return 'http://localhost:8000'
}

export const API_BASE_URL = resolveApiBaseUrl()

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(message: string, status: number, detail?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export class NetworkError extends Error {
  constructor(message = 'Błąd połączenia z serwerem') {
    super(message)
    this.name = 'NetworkError'
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function apiRequest<Response>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers = new Headers(options.headers)

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  let response: ResponseInit & globalThis.Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    throw new NetworkError(error instanceof Error ? error.message : undefined)
  }

  const contentType = response.headers.get('content-type') ?? ''
  let data: unknown = null

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else if (response.status !== 204) {
    data = await response.text()
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'detail' in data &&
      typeof data.detail === 'string'
        ? data.detail
        : response.statusText || 'Request failed'

    throw new ApiError(message, response.status, data)
  }

  return data as Response
}