import { create } from 'zustand'
import { useCartStore } from './cartStore'
import { useOrdersStore } from './ordersStore'

export interface User {
  id: string
  email: string
  name: string
  surname: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isAuthResolved: boolean
  setSession: (user: User) => void
  hydrateSession: (user: User | null) => void
  clearSession: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthResolved: false,

  setSession: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      isAuthResolved: true,
    })
  },

  hydrateSession: (user: User | null) => {
    set({
      user,
      isAuthenticated: user !== null,
      isAuthResolved: true,
    })
  },

  clearSession: () => {
    useCartStore.getState().clearCart()
    useOrdersStore.getState().clearOrders()
    set({
      user: null,
      isAuthenticated: false,
      isAuthResolved: true,
    })
  },

  logout: () => {
    useCartStore.getState().clearCart()
    useOrdersStore.getState().clearOrders()
    set({
      user: null,
      isAuthenticated: false,
      isAuthResolved: true,
    })
  },
}))
