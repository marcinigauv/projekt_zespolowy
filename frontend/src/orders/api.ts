import { apiRequest } from '../lib/api'
import type { ProductDto } from '../products/api'

type DecimalValue = number | string

export interface OrderPaymentDto {
  id: number
  status: string
}

export interface OrderItemDto {
  id: number
  quantity: number
  unitPrice: DecimalValue
  product: ProductDto
}

export interface OrderDto {
  id: number
  customerId: number
  orderDate: string
  totalAmount: DecimalValue
  items: OrderItemDto[]
  payment?: OrderPaymentDto | null
}

export interface ListOrdersRequestDto {
  page: number
  pageSize: number
}

export interface CreateOrderItemRequestDto {
  productId: number
  quantity: number
}

export interface CreateOrderRequestDto {
  products: CreateOrderItemRequestDto[]
}

export async function fetchOrdersApi(payload: ListOrdersRequestDto): Promise<OrderDto[]> {
  return apiRequest<OrderDto[]>('/orders/orders', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchOrderDetailsApi(orderId: number): Promise<OrderDto> {
  return apiRequest<OrderDto>(`/orders/${orderId}`, {
    method: 'GET',
  })
}

export async function createOrderApi(payload: CreateOrderRequestDto): Promise<OrderDto> {
  return apiRequest<OrderDto>('/orders/', {
    method: 'POST',
    body: payload,
  })
}