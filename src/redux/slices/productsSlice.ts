import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { normalizeApiError } from '@/api/normalizeError';
import type { ApiError, Product } from '@/api/types';

type ProductsState = {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  query: string;
  error: ApiError | null;
};

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  query: '',
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: ApiError }>(
  'products/fetchAll',
  async (_, thunkApi) => {
    try {
      const mod = await import('@/api/products');
      return await mod.fetchProductsApi();
    } catch (err) {
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  }
);

export const fetchProductById = createAsyncThunk<Product, { id: string }, { rejectValue: ApiError }>(
  'products/fetchById',
  async ({ id }, thunkApi) => {
    try {
      const mod = await import('@/api/products');
      return await mod.fetchProductByIdApi(id);
    } catch (err) {
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  }
);

export const searchProducts = createAsyncThunk<Product[], { query: string }, { rejectValue: ApiError }>(
  'products/search',
  async ({ query }, thunkApi) => {
    try {
      const mod = await import('@/api/products');
      return await mod.searchProductsApi(query);
    } catch (err) {
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  }
);

const slice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setQuery: (state, action: { payload: string }) => {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Failed to load products' };
      })
      .addCase(searchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Failed to search products' };
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.unshift(action.payload);
      });
  },
});

export const { setQuery } = slice.actions;
export const productsReducer = slice.reducer;

