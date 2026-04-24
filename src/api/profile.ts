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

