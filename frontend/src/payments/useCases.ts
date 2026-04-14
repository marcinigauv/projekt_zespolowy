import { Linking, Platform } from 'react-native'
import { ApiError, NetworkError } from '../lib/api'
import { createPaymentApi, fetchPaymentStatusApi, type PaymentDto } from './api'

export interface Payment {
  id: number
  externalId: string
  orderId: number
  status: string
  url: string | null
}

const RETRYABLE_PAYMENT_STATUSES = new Set(['ABANDONED', 'ERROR', 'EXPIRED', 'REJECTED'])
const IN_PROGRESS_PAYMENT_STATUSES = new Set(['NEW', 'PENDING'])

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  NEW: 'Nowa',
  PENDING: 'W toku',
  CONFIRMED: 'Opłacona',
  EXPIRED: 'Wygasła',
  REJECTED: 'Odrzucona',
  ERROR: 'Błąd',
  ABANDONED: 'Przerwana',
}

function mapPayment(payment: PaymentDto): Payment {
  return {
    id: payment.id,
    externalId: payment.external_id,
    orderId: payment.order_id,
    status: payment.status,
    url: payment.url ?? null,
  }
}

function mapPaymentsError(error: unknown): Error {
  if (error instanceof NetworkError) {
    return new Error('Brak połączenia z serwerem płatności')
  }

  if (error instanceof ApiError) {
    if (error.status === 404) {
      return new Error('Nie znaleziono płatności dla tego zamówienia')
    }

    if (error.status === 401 || error.status === 403) {
      return new Error('Sesja wygasła. Zaloguj się ponownie')
    }

    return new Error(typeof error.message === 'string' ? error.message : 'Nie udało się obsłużyć płatności')
  }

  return error instanceof Error ? error : new Error('Nie udało się obsłużyć płatności')
}

export function isPaymentConfirmed(status: string | null | undefined): boolean {
  return status === 'CONFIRMED'
}

export function isPaymentRetryable(status: string | null | undefined): boolean {
  return status !== undefined && status !== null && RETRYABLE_PAYMENT_STATUSES.has(status)
}

export function isPaymentInProgress(status: string | null | undefined): boolean {
  return status !== undefined && status !== null && IN_PROGRESS_PAYMENT_STATUSES.has(status)
}

export function getPaymentStatusLabel(status: string | null | undefined): string {
  if (!status) {
    return 'Brak płatności'
  }

  return PAYMENT_STATUS_LABELS[status] ?? status
}

export function getPaymentTone(status: string | null | undefined): 'danger' | 'neutral' | 'success' | 'warning' {
  if (status === 'CONFIRMED') {
    return 'success'
  }

  if (status === 'ABANDONED' || status === 'ERROR' || status === 'EXPIRED' || status === 'REJECTED') {
    return 'danger'
  }

  if (status === 'NEW' || status === 'PENDING') {
    return 'warning'
  }

  return 'neutral'
}

export function shouldShowPaymentRefresh(status: string | null | undefined): boolean {
  return !isPaymentConfirmed(status)
}

export function getPaymentActionLabel(status: string | null | undefined): string | null {
  if (isPaymentConfirmed(status)) {
    return null
  }

  if (isPaymentRetryable(status)) {
    return 'Ponów płatność'
  }

  if (isPaymentInProgress(status)) {
    return 'Dokończ płatność'
  }

  return 'Opłać zamówienie'
}

export async function createPaymentUseCase(orderId: number): Promise<Payment> {
  try {
    const payment = await createPaymentApi(orderId)
    return mapPayment(payment)
  } catch (error) {
    throw mapPaymentsError(error)
  }
}

export async function getPaymentStatusUseCase(orderId: number): Promise<Payment> {
  try {
    const payment = await fetchPaymentStatusApi(orderId)
    return mapPayment(payment)
  } catch (error) {
    throw mapPaymentsError(error)
  }
}

export async function openPaymentUrlUseCase(url: string | null): Promise<void> {
  if (!url) {
    throw new Error('Brak adresu do kontynuacji płatności')
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const paymentWindow = window.open(url, '_blank')

    if (paymentWindow) {
      paymentWindow.focus()
      return
    }

    window.location.assign(url)
    return
  }

  const canOpen = await Linking.canOpenURL(url)

  if (!canOpen) {
    throw new Error('Nie udało się otworzyć strony płatności')
  }

  await Linking.openURL(url)
}