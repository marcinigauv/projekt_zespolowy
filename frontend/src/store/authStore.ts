import { create } from 'zustand'
import { useCartStore } from './cartStore'
import { useOrdersStore } from './ordersStore'
import { type UserPreferences } from '../theme/options'

export interface User {
  id: string
  email: string
  name: string
  surname: string
  isAdmin: boolean
  userPreferences: UserPreferences
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isAuthResolved: boolean
  setSession: (user: User) => void
  hydrateSession: (user: User | null) => void
  updateUserPreferences: (preferences: UserPreferences) => void
  clearSession: () => void
  logout: () => void
}

function createClearedAuthState() {
  useCartStore.getState().clearCart()
  useOrdersStore.getState().clearOrders()

  return {
    user: null,
    isAuthenticated: false,
    isAuthResolved: true,
  }
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

  updateUserPreferences: (userPreferences: UserPreferences) => {
    set((state) => {
      if (!state.user) {
        return state
      }

      return {
        user: {
          ...state.user,
          userPreferences,
        },
      }
    })
  },

  clearSession: () => {
    set(createClearedAuthState())
  },

  logout: () => {
    set(createClearedAuthState())
  },
}))
