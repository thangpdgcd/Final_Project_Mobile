import axios from 'axios';

import { clearStoredAuth, getStoredAuthToken } from '@/api/authStorage';
import { APP_CONFIG } from '@/constants/config';
import { handleUnauthorizedOnce } from '@/redux/handleUnauthorized';

export const http = axios.create({
  baseURL: `${APP_CONFIG.apiBaseUrl}/api`,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(async (config) => {
  const token = await getStoredAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const body = response.data;
    // Backend standard shape: { success: boolean, message: string, data: any }
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = (body as { data: unknown }).data;
    }
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const url =
      error?.config?.baseURL && error?.config?.url
        ? `${error.config.baseURL}${error.config.url}`
        : error?.config?.url;
    const msg = error?.response?.data?.message ?? error?.message;
    const headers = error?.config?.headers ?? {};
    const skipLog =
      (typeof headers === 'object' && headers !== null && (headers as any)['X-Skip-Log'] === '1') ||
      Boolean((error?.config as any)?.skipLog);
    if (!skipLog) {
      console.log('[http] error', { status, url, msg });
    }

    if (status === 401) {
      await clearStoredAuth();
      await handleUnauthorizedOnce();
    }

    return Promise.reject(error);
  },
);
