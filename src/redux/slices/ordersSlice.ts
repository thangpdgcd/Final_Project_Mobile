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
  },
);

export const fetchStaffOrders = createAsyncThunk<Order[], void, { rejectValue: ApiError }>(
  'orders/fetchStaffAll',
  async (_, thunkApi) => {
    try {
      const mod = await import('@/api/orders');
      return await mod.fetchStaffOrdersApi();
    } catch (err) {
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  },
);

export const createOrder = createAsyncThunk<
  Order,
  {
    items: { productId: string; quantity: number; price?: number | null }[];
    note?: string;
    paymentMethod?: 'cod';
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

export const requestRefund = createAsyncThunk<
  Order,
  { orderId: string; note?: string },
  { rejectValue: ApiError }
>('orders/requestRefund', async ({ orderId, note }, thunkApi) => {
  try {
    const mod = await import('@/api/orders');
    return await mod.requestRefundApi(orderId, note ? { note } : undefined);
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
      .addCase(fetchStaffOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStaffOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchStaffOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Failed to load staff orders' };
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
      })
      .addCase(requestRefund.pending, (state) => {
        state.error = null;
      })
      .addCase(requestRefund.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.unshift(action.payload);
      })
      .addCase(requestRefund.rejected, (state, action) => {
        state.error = action.payload ?? { message: 'Failed to request refund' };
      });
  },
});

export const { resetCreateOrderStatus } = slice.actions;
export const ordersReducer = slice.reducer;
