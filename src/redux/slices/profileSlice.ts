import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { normalizeApiError } from '@/api/normalizeError';
import type { ApiError, User } from '@/api/types';

type ProfileState = {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: ApiError | null;
};

const initialState: ProfileState = {
  user: null,
  status: 'idle',
  error: null,
};

export const fetchProfile = createAsyncThunk<User, void, { rejectValue: ApiError }>(
  'profile/fetch',
  async (_, thunkApi) => {
    try {
      const mod = await import('@/api/profile');
      return await mod.getProfileApi();
    } catch (err) {
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  }
);

export const updateProfile = createAsyncThunk<
  User,
  { name?: string; phone?: string; avatarUrl?: string },
  { rejectValue: ApiError }
>('profile/update', async (payload, thunkApi) => {
  try {
    const mod = await import('@/api/profile');
    return await mod.updateProfileApi(payload);
  } catch (err) {
    return thunkApi.rejectWithValue(normalizeApiError(err));
  }
});

const slice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Failed to load profile' };
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Failed to update profile' };
      });
  },
});

export const profileReducer = slice.reducer;

