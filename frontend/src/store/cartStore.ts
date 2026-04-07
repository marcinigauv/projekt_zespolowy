import { create } from 'zustand'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
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

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find(i => i.id === item.id)
      
      if (existingItem) {
        return {
          items: state.items.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
      }
      
      return {
        items: [...state.items, { ...item, quantity: 1 }]
      }
    })
  },
  
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== id)
    }))
  },
  
  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map(item =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
    }))
  },
  
  clearCart: () => {
    set({ items: [] })
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
  },
  
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0)
  }
}))
