import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  quantity: number;
  specialRequests?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateSpecialRequests: (productId: string, requests: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),

      updateSpecialRequests: (productId, requests) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, specialRequests: requests } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const price = item.discountPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'ssdoces-cart',
      storage: typeof window !== 'undefined' 
        ? {
            getItem: (name) => {
              try {
                const item = localStorage.getItem(name);
                return item ? JSON.parse(item) : null;
              } catch {
                return null;
              }
            },
            setItem: (name, value) => {
              try {
                localStorage.setItem(name, JSON.stringify(value));
              } catch {
                // Handle storage errors silently
              }
            },
            removeItem: (name) => {
              try {
                localStorage.removeItem(name);
              } catch {
                // Handle storage errors silently
              }
            },
          }
        : undefined,
    }
  )
);
