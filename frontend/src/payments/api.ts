import { apiRequest } from '../lib/api'

export interface PaymentDto {
  id: number
  external_id: string
  order_id: number
  status: string
  url?: string | null
}

export async function createPaymentApi(orderId: number, returnUrl?: string): Promise<PaymentDto> {
  const returnUrlParam = returnUrl ? `&return_url=${encodeURIComponent(returnUrl)}` : ''

  return apiRequest<PaymentDto>(`/payments/create?order_id=${orderId}${returnUrlParam}`, {
    method: 'POST',
  })
}

export async function fetchPaymentStatusApi(orderId: number): Promise<PaymentDto> {
  return apiRequest<PaymentDto>(`/payments/status?order_id=${orderId}`, {
    method: 'GET',
  })
}