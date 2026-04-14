import { ApiError, NetworkError } from '../lib/api'
import type { CartItem } from '../store/cartStore'
import { useOrdersStore } from '../store/ordersStore'
import {
  createOrderApi,
  fetchOrderDetailsApi,
  fetchOrdersApi,
  type CreateOrderRequestDto,
  type OrderDto,
  type OrderItemDto,
  type OrderPaymentDto,
} from './api'
import {
  EmptyOrderError,
  InvalidOrderIdError,
  OrderNotFoundError,
  OrderOfflineError,
  OrdersUnauthorizedError,
  OrderServiceUnavailableError,
  OrderValidationError,
} from './exceptions'

export interface OrderPayment {
  id: number
  status: string
}

export interface OrderItem {
  id: number
  quantity: number
  unitPrice: number
  product: OrderItemDto['product']
}

export interface Order {
  id: number
  customerId: number
  orderDate: string
  totalAmount: number
  items: OrderItem[]
  payment: OrderPayment | null
}

export interface ListOrdersCommand {
  page?: number
  pageSize?: number
}

export interface CreateOrderCommand {
  products: Array<{
    productId: number
    quantity: number
  }>
}

const DEFAULT_ORDERS_PAGE = 1
const DEFAULT_ORDERS_PAGE_SIZE = 10

function toNumber(value: number | string): number {
  const parsedValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function mapOrderPayment(payment?: OrderPaymentDto | null): OrderPayment | null {
  if (!payment) {
    return null
  }

  return {
    id: payment.id,
    status: payment.status,
  }
}

function mapOrder(order: OrderDto): Order {
  return {
    id: order.id,
    customerId: order.customerId,
    orderDate: order.orderDate,
    totalAmount: toNumber(order.totalAmount),
    payment: mapOrderPayment(order.payment),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      product: item.product,
    })),
  }
}

function validateOrderId(orderId: number): void {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new InvalidOrderIdError()
  }
}

function normalizeListCommand(command: ListOrdersCommand): { page: number; pageSize: number } {
  const page = command.page ?? DEFAULT_ORDERS_PAGE
  const pageSize = command.pageSize ?? DEFAULT_ORDERS_PAGE_SIZE

  if (!Number.isInteger(page) || page <= 0) {
    throw new OrderValidationError('Numer strony musi być większy od 0')
  }

  if (!Number.isInteger(pageSize) || pageSize <= 0 || pageSize > 100) {
    throw new OrderValidationError('Rozmiar strony musi być z przedziału 1-100')
  }

  return { page, pageSize }
}

function mapOrdersError(error: unknown, orderId?: number): Error {
  if (error instanceof NetworkError) {
    return new OrderOfflineError()
  }

  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return new OrdersUnauthorizedError()
    }

    if (error.status === 404) {
      return new OrderNotFoundError(orderId)
    }

    if (error.status === 400 || error.status === 422) {
      return new OrderValidationError(typeof error.message === 'string' ? error.message : 'Nieprawidłowe dane zamówienia')
    }

    return new OrderServiceUnavailableError()
  }

  return error instanceof Error ? error : new OrderServiceUnavailableError()
}

export async function listOrdersUseCase(command: ListOrdersCommand = {}): Promise<Order[]> {
  const normalizedCommand = normalizeListCommand(command)

  try {
    const result = await fetchOrdersApi(normalizedCommand)
    const orders = result.map(mapOrder)
    useOrdersStore.getState().setOrders(orders)
    return orders
  } catch (error) {
    throw mapOrdersError(error)
  }
}

export async function getOrderUseCase(orderId: number): Promise<Order> {
  validateOrderId(orderId)

  const cachedOrder = useOrdersStore.getState().getOrderById(orderId)

  if (cachedOrder) {
    useOrdersStore.getState().setCurrentOrder(cachedOrder)
  }

  try {
    const result = await fetchOrderDetailsApi(orderId)
    const order = mapOrder(result)
    useOrdersStore.getState().upsertOrder(order)
    return order
  } catch (error) {
    if (cachedOrder) {
      return cachedOrder
    }

    throw mapOrdersError(error, orderId)
  }
}

export async function createOrderUseCase(command: CreateOrderCommand): Promise<Order> {
  if (command.products.length === 0) {
    throw new EmptyOrderError()
  }

  const payload: CreateOrderRequestDto = {
    products: command.products,
  }

  try {
    const result = await createOrderApi(payload)
    const order = mapOrder(result)
    useOrdersStore.getState().upsertOrder(order)
    return order
  } catch (error) {
    throw mapOrdersError(error)
  }
}

export function createOrderCommandFromCart(items: CartItem[]): CreateOrderCommand {
  if (items.length === 0) {
    throw new EmptyOrderError()
  }

  return {
    products: items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    })),
  }
}