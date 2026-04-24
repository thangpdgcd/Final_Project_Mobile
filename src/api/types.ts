export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  category?: string | null;
};

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type OrderLineItem = {
  productId: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  price?: number | null;
};

export type Order = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount?: number | null;
  items?: OrderLineItem[];
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
};

