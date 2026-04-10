import { create } from 'zustand'

const CART_STORAGE_KEY = 'cart:v1'
const CART_TTL_MS = 24 * 60 * 60 * 1000

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface PersistedCart {
  items: CartItem[]
  updatedAt: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

function canUseStorage(): boolean {
  return typeof globalThis.localStorage !== 'undefined'
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Record<string, unknown>

  return Number.isInteger(item.id)
    && typeof item.name === 'string'
    && typeof item.price === 'number'
    && typeof item.quantity === 'number'
    && Number.isInteger(item.quantity)
    && item.quantity > 0
}

function normalizeItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items.filter(isValidCartItem)
}

function clearPersistedCart() {
  if (!canUseStorage()) {
    return
  }

  globalThis.localStorage.removeItem(CART_STORAGE_KEY)
}

function readPersistedCart(): CartItem[] {
  if (!canUseStorage()) {
    return []
  }

  const rawValue = globalThis.localStorage.getItem(CART_STORAGE_KEY)

  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<PersistedCart>
    const updatedAt = typeof parsedValue.updatedAt === 'number' ? parsedValue.updatedAt : 0

    if (!updatedAt || Date.now() - updatedAt >= CART_TTL_MS) {
      clearPersistedCart()
      return []
    }

    const items = normalizeItems(parsedValue.items)

    if (items.length === 0) {
      clearPersistedCart()
    }

    return items
  } catch {
    clearPersistedCart()
    return []
  }
}

function persistCart(items: CartItem[]) {
  if (!canUseStorage()) {
    return
  }

  if (items.length === 0) {
    clearPersistedCart()
    return
  }

  const payload: PersistedCart = {
    items,
    updatedAt: Date.now(),
  }

  globalThis.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload))
}

const initialItems = readPersistedCart()

export const useCartStore = create<CartState>((set, get) => ({
  items: initialItems,
  
  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find(i => i.id === item.id)
      const nextItems = existingItem
        ? state.items.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { ...item, quantity: 1 }]

      persistCart(nextItems)
      
      return {
        items: nextItems
      }
    })
  },
  
  removeItem: (id) => {
    set((state) => {
      const nextItems = state.items.filter(item => item.id !== id)
      persistCart(nextItems)

      return {
        items: nextItems
      }
    })
  },
  
  updateQuantity: (id, quantity) => {
    set((state) => {
      const nextItems = quantity <= 0
        ? state.items.filter(item => item.id !== id)
        : state.items.map(item =>
            item.id === id
              ? { ...item, quantity }
              : item
          )

      persistCart(nextItems)

      return {
        items: nextItems
      }
    })
  },
  
  clearCart: () => {
    clearPersistedCart()
    set({ items: [] })
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
  },
  
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0)
  }
}))
