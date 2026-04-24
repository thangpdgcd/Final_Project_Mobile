import { http } from '@/api/http';
import type { Order, OrderLineItem } from '@/api/types';

type BackendOrder = {
  id?: number | string;
  orderId?: number | string;
  order_ID?: number | string;
  status?: string;
  createdAt?: string;
  totalAmount?: number | string | null;
  total_Amount?: number | string | null;
  order_Items?: Array<{
    productId?: number | string;
    quantity?: number | string;
    price?: number | string;
    products?: { productId?: number | string; name?: string; price?: number | string; image?: string | null } | null;
  }>;
};

const normalizeImageUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v) return null;
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:')) return v;
  // backend may store base64 without data header
  if (v.length > 80 && /^[A-Za-z0-9+/=\s]+$/.test(v)) return `data:image/jpeg;base64,${v.replace(/\s+/g, '')}`;
  return v;
};

const toOrderItems = (o: BackendOrder): OrderLineItem[] => {
  const rows = Array.isArray(o.order_Items) ? o.order_Items : [];
  return rows
    .map((r) => {
      const pid = r.products?.productId ?? r.productId ?? '';
      const name = r.products?.name ?? String(pid);
      const imageUrl = normalizeImageUrl(r.products?.image ?? null);
      const quantity = Math.max(1, Math.trunc(Number(r.quantity ?? 1)));
      const price = r.price == null ? (r.products?.price == null ? null : Number(r.products.price)) : Number(r.price);
      return { productId: String(pid), name: String(name), imageUrl, quantity, price };
    })
    .filter((x) => x.productId && x.productId !== 'undefined');
};

const toOrder = (o: BackendOrder): Order => {
  const rawId = o.id ?? o.orderId ?? o.order_ID ?? '';
  const status = String(o.status ?? 'pending') as Order['status'];
  const createdAt = typeof o.createdAt === 'string' && o.createdAt ? o.createdAt : new Date().toISOString();
  const totalAmountRaw = o.totalAmount ?? o.total_Amount ?? null;
  const totalAmount = totalAmountRaw == null ? null : Number(totalAmountRaw);
  const items = toOrderItems(o);
  return { id: String(rawId), status, createdAt, totalAmount, items };
};

export const fetchOrdersApi = async () => {
  // Customer orders endpoint
  const res = await http.get<BackendOrder[]>('/my-orders');
  return (Array.isArray(res.data) ? res.data : []).map(toOrder);
};

export const createOrderFromCartApi = async (payload: {
  items: Array<{ productId: string; quantity: number; price?: number | null }>;
  note?: string;
  paymentMethod?: 'cod' | 'paypal';
  shippingAddress?: string;
  shippingMethod?: 'standard' | 'express';
}) => {
  const res = await http.post<{ order: BackendOrder }>('/orders', payload);
  return toOrder((res.data as { order?: BackendOrder } | null)?.order ?? {});
};

