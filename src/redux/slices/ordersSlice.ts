import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { normalizeApiError } from '@/api/normalizeError';
import type { ApiError, Order } from '@/api/types';

type OrdersState = {
  items: Order[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: ApiError | null;
};

const initialState: OrdersState = {
  items: [],
  status: 'idle',
  createStatus: 'idle',
  error: null,
};

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: ApiError }>(
  'orders/fetchAll',
  async (_, thunkApi) => {
    try {
      const mod = await import('@/api/orders');
      return await mod.fetchOrdersApi();
    } catch (err) {
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  }
);

export const createOrder = createAsyncThunk<
  Order,
  {
    items: Array<{ productId: string; quantity: number; price?: number | null }>;
    note?: string;
    paymentMethod?: 'cod' | 'paypal';
    shippingAddress?: string;
    shippingMethod?: 'standard' | 'express';
  },
  { rejectValue: ApiError }
>('orders/createFromCart', async (payload, thunkApi) => {
  try {
    const mod = await import('@/api/orders');
    return await mod.createOrderFromCartApi(payload);
  } catch (err) {
    return thunkApi.rejectWithValue(normalizeApiError(err));
  }
});

const slice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCreateOrderStatus: (state) => {
      state.createStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Failed to load orders' };
      })
      .addCase(createOrder.pending, (state) => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload ?? { message: 'Failed to create order' };
      });
  },
});

export const { resetCreateOrderStatus } = slice.actions;
export const ordersReducer = slice.reducer;

