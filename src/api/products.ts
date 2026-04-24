import { http } from '@/api/http';
import type { Product } from '@/api/types';

type BackendProduct = {
  productId?: number | string;
  product_ID?: number | string;
  id?: number | string;
  name?: string;
  description?: string | null;
  price?: number | string | null;
  image?: string | null;
  imageUrl?: string | null;
  categories?: { name?: string | null } | null;
};

const isProbablyBase64 = (s: string) => {
  // base64 should be long-ish; allow line breaks/whitespace
  const trimmed = s.trim();
  if (trimmed.length < 80) return false;
  return /^[A-Za-z0-9+/=\s]+$/.test(trimmed);
};

const normalizeImageUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v) return null;
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:')) return v;
  if (isProbablyBase64(v)) {
    // backend stores base64 string (no header)
    return `data:image/jpeg;base64,${v.replace(/\s+/g, '')}`;
  }
  return v;
};

const toProduct = (p: BackendProduct): Product => {
  const rawId = p.productId ?? p.product_ID ?? p.id ?? '';
  return {
    id: String(rawId),
    name: String(p.name ?? ''),
    description: p.description ?? null,
    price: p.price == null ? null : Number(p.price),
    imageUrl: normalizeImageUrl(p.imageUrl ?? p.image),
    category: p.categories?.name ?? null,
  };
};

export const fetchProductsApi = async () => {
  const res = await http.get<unknown>('/products');
  const body = res.data as
    | Product[]
    | BackendProduct[]
    | { products?: BackendProduct[] | Product[] }
    | { products?: BackendProduct[] | Product[]; errorCode?: number; message?: string }
    | null;

  const list = Array.isArray(body) ? body : Array.isArray(body?.products) ? body.products : [];
  return (list as BackendProduct[]).map(toProduct);
};

export const searchProductsApi = async (name: string) => {
  const q = String(name ?? '').trim();
  const res = await http.get<unknown>('/products', { params: q ? { name: q } : undefined });
  const body = res.data as
    | Product[]
    | BackendProduct[]
    | { products?: BackendProduct[] | Product[] }
    | { products?: BackendProduct[] | Product[]; errorCode?: number; message?: string }
    | null;
  const list = Array.isArray(body) ? body : Array.isArray(body?.products) ? body.products : [];
  return (list as BackendProduct[]).map(toProduct);
};

export const fetchProductByIdApi = async (id: string) => {
  const res = await http.get<unknown>(`/products/${id}`);
  const body = res.data as BackendProduct | Product | null;
  return toProduct(body ?? {});
};

