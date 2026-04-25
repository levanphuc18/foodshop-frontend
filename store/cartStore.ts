import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItemResponse } from '@/types/cart';

interface CartState {
  items: CartItemResponse[];
  addItem: (item: CartItemResponse) => void;
  setItems: (items: CartItemResponse[]) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return { items: state.items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i) };
          }
          return { items: [...state.items, item] };
        }),
      setItems: (items) => set({ items }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => i.productId === productId ? { ...i, quantity } : i),
        })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.productPrice * i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
