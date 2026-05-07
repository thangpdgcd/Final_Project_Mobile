import type { AuthResponse } from '@/api/types';
import { apiPost } from '../lib/api';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
};

const isHttpStatusError = (e: unknown, status: number) =>
  e instanceof Error && typeof e.message === 'string' && e.message.startsWith(`HTTP ${status}`);

export const loginApi = async (input: LoginInput) => {
  const email = String(input.email ?? '').trim();
  const password = String(input.password ?? '');

  const attempts: { path: string; body: unknown }[] = [
    // current expected
    { path: '/api/login', body: { email, password } },
    // common backend variants
    { path: '/api/login', body: { username: email, password } },
    { path: '/login', body: { email, password } },
    { path: '/login', body: { username: email, password } },
    { path: '/api/auth/login', body: { email, password } },
    { path: '/api/auth/login', body: { username: email, password } },
    { path: '/auth/login', body: { email, password } },
    { path: '/auth/login', body: { username: email, password } },
  ];

  let lastErr: unknown;
  for (const a of attempts) {
    try {
      const data = await apiPost(a.path, a.body);
      const token = data?.token ?? data?.accessToken ?? data?.data?.token ?? data?.data?.accessToken;
      if (!token) throw new Error('Login succeeded but token missing');
      const user = data?.user ?? data?.data?.user ?? null;
      return { token, user } as AuthResponse;
    } catch (e) {
      lastErr = e;
      // only fallback on 401/404; otherwise bubble up (network, 500, etc.)
      if (!(isHttpStatusError(e, 401) || isHttpStatusError(e, 404))) throw e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Login failed');
};

export const registerApi = async (input: RegisterInput) => {
  // Backend register does not return access token; login after register.
  await apiPost('/api/register', input);
  const data = await apiPost('/api/login', { email: input.email, password: input.password });
  const token = data?.token ?? data?.accessToken;
  return { token, user: data?.user } as AuthResponse;
};

export const logoutApi = async () => {
  await apiPost('/api/logout');
  return { ok: true };
};

export const getMeApi = async () => {
  // Keep existing flow for now (token-based auth for native uses axios interceptors elsewhere).
  // If needed, we can extend fetch helper to add Authorization header too.
  throw new Error('getMeApi is not wired to fetch helper yet.');
};
