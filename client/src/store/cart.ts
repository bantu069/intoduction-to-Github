import { create } from 'zustand';

export type CartItem = { itemId: number; name: string; priceCents: number; quantity: number };

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  update: (itemId: number, quantity: number) => void;
  clear: () => void;
  totalCents: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  add: (item, qty = 1) => {
    const existing = get().items.find((i) => i.itemId === item.itemId);
    if (existing) {
      set({ items: get().items.map((i) => (i.itemId === item.itemId ? { ...i, quantity: i.quantity + qty } : i)) });
    } else {
      set({ items: [...get().items, { ...item, quantity: qty }] });
    }
  },
  update: (itemId, quantity) => set({ items: get().items.map((i) => (i.itemId === itemId ? { ...i, quantity } : i)) }),
  clear: () => set({ items: [] }),
  totalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)
}));
