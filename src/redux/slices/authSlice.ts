import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getMeApi, loginApi, logoutApi, registerApi } from '@/api/auth';
import {
  clearStoredAuth,
  getStoredAuthToken,
  getStoredAuthUser,
  setStoredAuthToken,
  setStoredAuthUser,
} from '@/api/authStorage';
import { normalizeApiError } from '@/api/normalizeError';
import type { ApiError, AuthResponse, User } from '@/api/types';

type AuthState = {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: ApiError | null;
};

const initialState: AuthState = {
  token: null,
  user: null,
  isHydrated: false,
  status: 'idle',
  error: null,
};

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const [token, rawUser] = await Promise.all([getStoredAuthToken(), getStoredAuthUser()]);
  const user = rawUser ? (JSON.parse(rawUser) as User) : null;
  return { token, user };
});

export const login = createAsyncThunk<AuthResponse, { email: string; password: string }, { rejectValue: ApiError }>(
  'auth/login',
  async (payload, thunkApi) => {
    try {
      const data = await loginApi(payload);
      await Promise.all([setStoredAuthToken(data.token), setStoredAuthUser(JSON.stringify(data.user))]);
      return data;
    } catch (err) {
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  }
);

export const register = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; password: string },
  { rejectValue: ApiError }
>('auth/register', async (payload, thunkApi) => {
  try {
    const data = await registerApi(payload);
    await Promise.all([setStoredAuthToken(data.token), setStoredAuthUser(JSON.stringify(data.user))]);
    return data;
  } catch (err) {
    return thunkApi.rejectWithValue(normalizeApiError(err));
  }
});

export const logout = createAsyncThunk<{ ok: boolean }, void, { rejectValue: ApiError }>(
  'auth/logout',
  async (_, thunkApi) => {
    try {
      const data = await logoutApi();
      await clearStoredAuth();
      return data;
    } catch (err) {
      await clearStoredAuth();
      return thunkApi.rejectWithValue(normalizeApiError(err));
    }
  }
);

export const refreshMe = createAsyncThunk<User, void, { rejectValue: ApiError }>('auth/me', async (_, thunkApi) => {
  try {
    const user = await getMeApi();
    await setStoredAuthUser(JSON.stringify(user));
    return user;
  } catch (err) {
    return thunkApi.rejectWithValue(normalizeApiError(err));
  }
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isHydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isHydrated = true;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Login failed' };
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Registration failed' };
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'succeeded';
        state.token = null;
        state.user = null;
      })
      .addCase(logout.rejected, (state) => {
        state.status = 'failed';
        state.token = null;
        state.user = null;
      })
      .addCase(refreshMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearAuthError } = slice.actions;
export const authReducer = slice.reducer;

