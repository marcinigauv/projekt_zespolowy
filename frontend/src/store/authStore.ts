import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  surname: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setSession: (user: User) => void
  clearSession: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setSession: (user: User) => {
    set({
      user,
      isAuthenticated: true,
    })
  },

  clearSession: () => {
    set({
      user: null,
      isAuthenticated: false,
    })
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    })
  },
}))
