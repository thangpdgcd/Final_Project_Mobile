import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { normalizeApiError } from '@/api/normalizeError';
import type { ApiError, AppNotification } from '@/api/types';

type NotificationsState = {
  items: AppNotification[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: ApiError | null;
};

const initialState: NotificationsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchNotifications = createAsyncThunk<AppNotification[], void, { rejectValue: ApiError }>(
  'notifications/fetchAll',
  async (_, thunkApi) => {
    try {
      const mod = await import('@/api/notifications');
      return await mod.fetchNotificationsApi();
    } catch (err) {
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  }
);

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Failed to load notifications' };
      });
  },
});

export const notificationsReducer = slice.reducer;

