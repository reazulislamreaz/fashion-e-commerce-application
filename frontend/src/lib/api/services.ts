import { apiClient } from './client';
import {
  AuthResult,
  Category,
  Order,
  PaginatedList,
  Product,
  Size,
  Style,
  User,
} from '@/types';

// Catalog APIs
export async function getCategories() {
  return apiClient.get<PaginatedList<Category>>('/categories', {
    query: { limit: 100, status: 'active' },
  });
}

export async function getStyles() {
  return apiClient.get<PaginatedList<Style>>('/styles', {
    query: { limit: 100, status: 'active' },
  });
}

export async function getSizes() {
  return apiClient.get<PaginatedList<Size>>('/sizes', {
    query: { limit: 100, status: 'active' },
  });
}

// Product APIs
export type ProductQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  styleId?: string;
  sizeId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getProducts(params?: ProductQueryParams) {
  return apiClient.get<PaginatedList<Product>>('/products', {
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 12,
      status: 'active',
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params?.styleId ? { styleId: params.styleId } : {}),
      ...(params?.sizeId ? { sizeId: params.sizeId } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
    },
  });
}

export async function getProductById(id: string) {
  return apiClient.get<Product>(`/products/${id}`);
}

// Auth APIs
export async function loginApi(credentials: { email: string; password: string }) {
  return apiClient.post<AuthResult>('/auth/login', credentials);
}

export async function registerApi(data: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  return apiClient.post<AuthResult>('/auth/register', data);
}

export async function getMeApi(token: string) {
  return apiClient.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function logoutApi(token: string, refreshToken: string) {
  return apiClient.post<void>(
    '/auth/logout',
    { refreshToken },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function refreshApi(refreshToken: string) {
  return apiClient.post<AuthResult>('/auth/refresh', { refreshToken });
}

// Order APIs
export type CreateOrderInput = {
  customerName: string;
  phoneNumber: string;
  shippingAddress: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export async function createOrderApi(input: CreateOrderInput, token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return apiClient.post<Order>('/orders', input, { headers });
}

export async function getMyOrdersApi(token: string, page = 1, limit = 10) {
  return apiClient.get<PaginatedList<Order>>('/orders', {
    query: { page, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getOrderByIdApi(id: string, token: string) {
  return apiClient.get<Order>(`/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
