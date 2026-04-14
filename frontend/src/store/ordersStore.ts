import { create } from 'zustand'
import type { Order } from '../orders/useCases'

interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  setOrders: (orders: Order[]) => void
  setCurrentOrder: (order: Order | null) => void
  upsertOrder: (order: Order) => void
  getOrderById: (orderId: number) => Order | null
  clearOrders: () => void
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  currentOrder: null,

  setOrders: (orders) => {
    set((state) => {
      const currentOrder = state.currentOrder
      const hasCurrentOrder = currentOrder
        ? orders.some((order) => order.id === currentOrder.id)
        : false

      return {
        orders,
        currentOrder: hasCurrentOrder ? currentOrder : state.currentOrder,
      }
    })
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order })
  },

  upsertOrder: (order) => {
    set((state) => {
      const existingIndex = state.orders.findIndex((entry) => entry.id === order.id)

      if (existingIndex === -1) {
        return {
          orders: [order, ...state.orders],
          currentOrder: order,
        }
      }

      const nextOrders = [...state.orders]
      nextOrders[existingIndex] = order

      return {
        orders: nextOrders,
        currentOrder: order,
      }
    })
  },

  getOrderById: (orderId) => {
    const state = get()

    if (state.currentOrder?.id === orderId) {
      return state.currentOrder
    }

    return state.orders.find((order) => order.id === orderId) ?? null
  },

  clearOrders: () => {
    set({
      orders: [],
      currentOrder: null,
    })
  },
}))