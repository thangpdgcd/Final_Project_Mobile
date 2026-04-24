import axios from 'axios';

import { APP_CONFIG } from '@/constants/config';
import { getStoredAuthToken } from '@/api/authStorage';

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

http.interceptors.response.use((response) => {
  const body = response.data;
  // Backend standard shape: { success: boolean, message: string, data: any }
  if (body && typeof body === 'object' && 'data' in body) {
    response.data = (body as { data: unknown }).data;
  }
  return response;
});

