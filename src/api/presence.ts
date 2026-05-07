import { http } from '@/api/http';

export type BasicUser = {
  userId: number | string | null;
  name: string | null;
  email: string | null;
  roleID: number | string | null;
};

export async function getOnlineStaffApi() {
  const res = await http.get<BasicUser[]>('/staff/online');
  return Array.isArray(res.data) ? res.data : [];
}
