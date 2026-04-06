import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
  register: (email: string, password: string, name: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  // Dummy login - tylko ustawia stan
  login: (email: string, password: string) => {
    set({
      user: {
        id: '1',
        email,
        name: 'Użytkownik Testowy'
      },
      isAuthenticated: true
    })
  },
  
  // Wylogowanie
  logout: () => {
    set({
      user: null,
      isAuthenticated: false
    })
  },
  
  // Dummy rejestracja
  register: (email: string, password: string, name: string) => {
    set({
      user: {
        id: '1',
        email,
        name
      },
      isAuthenticated: true
    })
  }
}))
