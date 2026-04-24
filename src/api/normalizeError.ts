import type { AxiosError } from 'axios';

import type { ApiError } from '@/api/types';

const isAxiosError = (err: unknown): err is AxiosError =>
  typeof err === 'object' && err !== null && 'isAxiosError' in err;

export const normalizeApiError = (err: unknown): ApiError => {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;

    if (typeof data === 'object' && data !== null) {
      const maybeMessage = (data as { message?: unknown }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
        return { message: maybeMessage, status, details: data };
      }
    }

    if (typeof err.message === 'string' && err.message.trim().length > 0) {
      return { message: err.message, status, details: data };
    }

    return { message: 'Request failed', status, details: data };
  }

  if (err instanceof Error) {
    return { message: err.message };
  }

  return { message: 'Something went wrong' };
};

