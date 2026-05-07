import { http } from '@/api/http';
import type { Order, OrderLineItem, OrderStatus } from '@/api/types';

type BackendOrder = {
  id?: number | string;
  orderId?: number | string;
  order_ID?: number | string;
  status?: string;
  createdAt?: string;
  totalAmount?: number | string | null;
  total_Amount?: number | string | null;
  order_Items?: {
    productId?: number | string;
    quantity?: number | string;
    price?: number | string;
    products?: {
      productId?: number | string;
      name?: string;
      price?: number | string;
      image?: string | null;
    } | null;
  }[];
};

const normalizeImageUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v) return null;
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:')) return v;
  // backend may store base64 without data header
  if (v.length > 80 && /^[A-Za-z0-9+/=\s]+$/.test(v))
    return `data:image/jpeg;base64,${v.replace(/\s+/g, '')}`;
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
      const price =
        r.price == null ? (r.products?.price == null ? null : Number(r.products.price)) : Number(r.price);
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

export const fetchStaffOrdersApi = async (params?: { status?: string; assigned?: string }) => {
  const res = await http.get<BackendOrder[]>('/staff/orders', { params });
  return (Array.isArray(res.data) ? res.data : []).map(toOrder);
};

export const createOrderFromCartApi = async (payload: {
  items: { productId: string; quantity: number; price?: number | null }[];
  note?: string;
  paymentMethod?: 'cod';
  shippingAddress?: string;
  shippingMethod?: 'standard' | 'express';
}) => {
  // Align with backend accepted keys:
  // - shipping_Address OR shippingAddress
  // - items OR orderItems OR cartItems
  const body = {
    items: payload.items,
    orderItems: payload.items,
    cartItems: payload.items,
    note: payload.note,
    paymentMethod: payload.paymentMethod,
    shippingAddress: payload.shippingAddress,
    shipping_Address: payload.shippingAddress,
    shippingMethod: payload.shippingMethod,
  };
  const res = await http.post<{ order: BackendOrder }>('/orders', body);
  return toOrder((res.data as { order?: BackendOrder } | null)?.order ?? {});
};

export const getOrderByIdApi = async (id: string) => {
  const res = await http.get<BackendOrder>(`/orders/${id}`);
  return toOrder(res.data ?? {});
};

export const cancelOrderApi = async (id: string, payload?: { note?: string }) => {
  const res = await http.patch<{ order?: BackendOrder }>(`/orders/${id}/cancel`, payload ?? {});
  const body = res.data as { order?: BackendOrder } | BackendOrder | null;
  const order = (body as { order?: BackendOrder } | null)?.order ?? (body as BackendOrder | null) ?? {};
  return toOrder(order);
};

export const requestRefundApi = async (id: string, payload?: { note?: string }) => {
  const res = await http.patch<{ order?: BackendOrder }>(`/orders/${id}/refund-request`, payload ?? {});
  const body = res.data as { order?: BackendOrder } | BackendOrder | null;
  const order = (body as { order?: BackendOrder } | null)?.order ?? (body as BackendOrder | null) ?? {};
  return toOrder(order);
};

export const resolveRefundApi = async (
  id: string,
  payload?: {
    approved: boolean;
    note?: string;
  },
) => {
  const res = await http.patch<{ order?: BackendOrder }>(
    `/orders/${id}/refund`,
    payload ?? { approved: true },
  );
  const body = res.data as { order?: BackendOrder } | BackendOrder | null;
  const order = (body as { order?: BackendOrder } | null)?.order ?? (body as BackendOrder | null) ?? {};
  return toOrder(order);
};

export const updateOrderStatusApi = async (id: string, payload: { status: OrderStatus }) => {
  const res = await http.patch<{ order?: BackendOrder }>(`/orders/${id}/status`, payload);
  const body = res.data as { order?: BackendOrder } | BackendOrder | null;
  const order = (body as { order?: BackendOrder } | null)?.order ?? (body as BackendOrder | null) ?? {};
  return toOrder(order);
};

export const updateOrderApi = async (id: string, payload: unknown) => {
  const res = await http.put<unknown>(`/orders/${id}`, payload);
  return res.data;
};

export const deleteOrderApi = async (id: string) => {
  const res = await http.delete<unknown>(`/orders/${id}`);
  return res.data;
};
