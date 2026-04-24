import { http } from '@/api/http';
import type { AppNotification } from '@/api/types';

type BackendNotification = {
  id?: number | string;
  message?: string;
  type?: string;
  createdAt?: string;
  isRead?: boolean;
};

const titleFromType = (type: string | undefined) => {
  const t = String(type ?? '').toLowerCase();
  if (t === 'order') return 'Order';
  if (t === 'chat') return 'Chat';
  if (t === 'voucher') return 'Voucher';
  return 'Notification';
};

const extractOrderId = (message: string) => {
  // Examples from backend:
  // - "Đơn hàng #123 đã được tạo thành công"
  // - "New order #123 created"
  const m = /#\s*(\d+)/.exec(message);
  return m?.[1] ? String(m[1]) : null;
};

export const fetchNotificationsApi = async () => {
  const res = await http.get<unknown>('/notifications');
  const body = res.data as { items?: BackendNotification[] } | BackendNotification[] | null;
  const list = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : [];
  return list.map((n): AppNotification => ({
    id: String(n.id ?? ''),
    title: (() => {
      const msg = String(n.message ?? '');
      const t = String(n.type ?? '').toLowerCase();
      if (t === 'order') {
        const orderId = extractOrderId(msg);
        if (orderId) return `Order #${orderId}`;
      }
      return titleFromType(n.type);
    })(),
    body: String(n.message ?? ''),
    createdAt: typeof n.createdAt === 'string' ? n.createdAt : new Date().toISOString(),
    isRead: Boolean(n.isRead),
  }));
};

