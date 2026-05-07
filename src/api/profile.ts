import { http } from '@/api/http';
import type { User } from '@/api/types';

export const getProfileApi = async () => {
  const res = await http.get<User>('/me');
  return res.data;
};

export const updateProfileApi = async (payload: { name?: string; phone?: string; avatarUrl?: string }) => {
  // Backend route: PUT /api/profile
  const res = await http.put<User>('/profile', payload);
  return res.data;
};

export const changePasswordApi = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}) => {
  const bodyA = {
    oldPassword: payload.oldPassword,
    newPassword: payload.newPassword,
    confirmNewPassword: payload.confirmNewPassword,
  };

  // Common alternative payload keys used by many backends.
  const bodyB = {
    currentPassword: payload.oldPassword,
    password: payload.newPassword,
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmNewPassword,
  };

  const attempts: { method: 'put' | 'post'; url: string; data: unknown }[] = [
    { method: 'put', url: '/profile/password', data: bodyA }, // expected
    { method: 'put', url: '/profile/change-password', data: bodyA },
    { method: 'put', url: '/profile/update-password', data: bodyA },
    { method: 'put', url: '/me/change-password', data: bodyA },
    { method: 'put', url: '/me/password', data: bodyA },
    { method: 'put', url: '/account/password', data: bodyA },
    { method: 'put', url: '/auth/change-password', data: bodyA },
    { method: 'post', url: '/auth/change-password', data: bodyA },
    { method: 'put', url: '/users/password', data: bodyA },
    { method: 'put', url: '/users/update-password', data: bodyA },
    { method: 'post', url: '/profile/password', data: bodyA },
    { method: 'post', url: '/profile/change-password', data: bodyA },
    { method: 'post', url: '/profile/update-password', data: bodyA },
    { method: 'post', url: '/users/change-password', data: bodyA },
    { method: 'post', url: '/users/update-password', data: bodyA },

    // Same endpoints but alternative body shape
    { method: 'put', url: '/profile/password', data: bodyB },
    { method: 'put', url: '/profile/change-password', data: bodyB },
    { method: 'put', url: '/profile/update-password', data: bodyB },
    { method: 'put', url: '/me/change-password', data: bodyB },
    { method: 'put', url: '/users/password', data: bodyB },
    { method: 'put', url: '/users/update-password', data: bodyB },
    { method: 'put', url: '/account/password', data: bodyB },
    { method: 'put', url: '/auth/change-password', data: bodyB },
    { method: 'post', url: '/auth/change-password', data: bodyB },
    { method: 'post', url: '/profile/password', data: bodyB },
    { method: 'post', url: '/profile/change-password', data: bodyB },
    { method: 'post', url: '/profile/update-password', data: bodyB },
    { method: 'post', url: '/users/change-password', data: bodyB },
    { method: 'post', url: '/users/update-password', data: bodyB },
  ];

  let lastErr: unknown = null;
  const tried: string[] = [];
  for (const a of attempts) {
    try {
      tried.push(`${a.method.toUpperCase()} ${a.url}`);
      const res = await http.request<unknown>({
        method: a.method,
        url: a.url,
        data: a.data,
        headers: { 'X-Skip-Log': '1' },
        skipLog: true,
      } as any);
      return res.data;
    } catch (err: any) {
      lastErr = err;
      const status = err?.response?.status;
      // If endpoint not found or method not allowed, try next.
      if (status === 404 || status === 405) continue;
      // Forbidden usually means "wrong endpoint for current role" (e.g. admin-only user route).
      if (status === 403) continue;
      // Some backends wrap "Not found" as 404 with custom message.
      const msg = String(err?.response?.data?.message ?? err?.message ?? '');
      if (status == null && /not found/i.test(msg)) continue;
      throw err;
    }
  }
  const final = lastErr ?? new Error('Change password failed');
  (final as any).message =
    (final as any)?.message && String((final as any).message).trim().length > 0
      ? (final as any).message
      : `Change password failed. Tried: ${tried.join(', ')}`;
  throw final;
};
