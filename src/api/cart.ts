import { http } from '@/api/http';

export type CartItemDto = {
  id: number | string;
  productId: number | string;
  quantity: number;
  price?: number | null;
  product?: unknown;
};

export async function getMyCartApi() {
  const res = await http.get<unknown>('/carts');
  return res.data as unknown;
}

export async function addToCartApi(payload: {
  productId: number | string;
  quantity: number;
  price?: number | null;
}) {
  const res = await http.post<unknown>('/add-to-cart', payload);
  return res.data as unknown;
}

export async function updateCartItemQtyApi(cartItemId: number | string, payload: { quantity: number }) {
  const res = await http.put<unknown>(`/cart-items/${cartItemId}`, payload);
  return res.data as unknown;
}

export async function removeCartItemApi(cartItemId: number | string) {
  const res = await http.delete<unknown>(`/cart-items/${cartItemId}`);
  return res.data as unknown;
}
