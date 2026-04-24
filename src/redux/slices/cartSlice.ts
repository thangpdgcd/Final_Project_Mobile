import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Product } from '@/api/types';

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartLine[];
};

const initialState: CartState = {
  items: [],
};

const findIndexByProductId = (items: CartLine[], productId: string) =>
  items.findIndex((l) => l.product.id === productId);

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const qty = Math.max(1, action.payload.quantity ?? 1);
      const idx = findIndexByProductId(state.items, action.payload.product.id);
      if (idx >= 0) {
        state.items[idx].quantity += qty;
      } else {
        state.items.push({ product: action.payload.product, quantity: qty });
      }
    },
    increment: (state, action: PayloadAction<{ productId: string }>) => {
      const idx = findIndexByProductId(state.items, action.payload.productId);
      if (idx >= 0) state.items[idx].quantity += 1;
    },
    decrement: (state, action: PayloadAction<{ productId: string }>) => {
      const idx = findIndexByProductId(state.items, action.payload.productId);
      if (idx < 0) return;
      state.items[idx].quantity -= 1;
      if (state.items[idx].quantity <= 0) state.items.splice(idx, 1);
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string }>) => {
      const idx = findIndexByProductId(state.items, action.payload.productId);
      if (idx >= 0) state.items.splice(idx, 1);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, increment, decrement, removeFromCart, clearCart } = slice.actions;
export const cartReducer = slice.reducer;

