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

const stripInlineIds = (message: string) => {
  // Remove common inline ids like "#123" but keep the rest readable.
  // Also cleanup extra spaces left behind.
  return String(message ?? '')
    .replace(/#\s*\d+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const fetchNotificationsApi = async () => {
  const res = await http.get<unknown>('/notifications');
  const body = res.data as { items?: BackendNotification[] } | BackendNotification[] | null;
  const list = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : [];
  return list.map(
    (n): AppNotification => ({
      id: String(n.id ?? ''),
      type: typeof n.type === 'string' ? n.type : null,
      title: (() => {
        const msg = String(n.message ?? '');
        const t = String(n.type ?? '').toLowerCase();
        if (t === 'order') {
          // Do not show order id in the UI title
          const orderId = extractOrderId(msg);
          if (orderId) return 'Order';
        }
        return titleFromType(n.type);
      })(),
      body: stripInlineIds(n.message ?? ''),
      createdAt: typeof n.createdAt === 'string' ? n.createdAt : new Date().toISOString(),
      isRead: Boolean(n.isRead),
    }),
  );
};
