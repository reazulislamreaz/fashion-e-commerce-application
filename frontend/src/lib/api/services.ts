import { apiClient } from './client';
import {
  AuthResult,
  Category,
  CreateCategoryInput,
  CreateProductInput,
  CreateSizeInput,
  CreateStyleInput,
  CreateUserInput,
  DashboardStats,
  Order,
  OrderStatus,
  PaginatedList,
  Product,
  Role,
  RoleCode,
  Size,
  Style,
  UpdateCategoryInput,
  UpdateProductInput,
  UpdateSizeInput,
  UpdateStyleInput,
  UpdateUserInput,
  User,
  UserQueryParams,
  UserStatus,
} from '@/types';

// Catalog APIs (Customer + Admin)
export async function getCategories(query?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return apiClient.get<PaginatedList<Category>>('/categories', {
    query: {
      page: query?.page ?? 1,
      limit: query?.limit ?? 100,
      status: query?.status ?? 'active',
      ...(query?.search ? { search: query.search } : {}),
    },
  });
}

export async function getStyles(query?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return apiClient.get<PaginatedList<Style>>('/styles', {
    query: {
      page: query?.page ?? 1,
      limit: query?.limit ?? 100,
      status: query?.status ?? 'active',
      ...(query?.search ? { search: query.search } : {}),
    },
  });
}

export async function getSizes(query?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return apiClient.get<PaginatedList<Size>>('/sizes', {
    query: {
      page: query?.page ?? 1,
      limit: query?.limit ?? 100,
      status: query?.status ?? 'active',
      ...(query?.search ? { search: query.search } : {}),
    },
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
      status: params?.status ?? 'active',
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

export async function getMyOrdersApi(
  token: string,
  page = 1,
  limit = 10,
  status?: OrderStatus,
) {
  return apiClient.get<PaginatedList<Order>>('/orders', {
    query: { page, limit, ...(status ? { status } : {}) },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getOrderByIdApi(id: string, token: string) {
  return apiClient.get<Order>(`/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ==========================================
// Dashboard & Management Administration APIs
// ==========================================

export async function getDashboardStatsApi(token: string) {
  return apiClient.get<DashboardStats>('/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Management Product CRUD
export async function createProductApi(data: CreateProductInput, token: string) {
  return apiClient.post<Product>('/products', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateProductApi(
  id: string,
  data: UpdateProductInput,
  token: string,
) {
  return apiClient.patch<Product>(`/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteProductApi(id: string, token: string) {
  return apiClient.delete<Product>(`/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Management Category CRUD
export async function createCategoryApi(data: CreateCategoryInput, token: string) {
  return apiClient.post<Category>('/categories', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateCategoryApi(
  id: string,
  data: UpdateCategoryInput,
  token: string,
) {
  return apiClient.patch<Category>(`/categories/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteCategoryApi(id: string, token: string) {
  return apiClient.delete<Category>(`/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Management Size CRUD
export async function createSizeApi(data: CreateSizeInput, token: string) {
  return apiClient.post<Size>('/sizes', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateSizeApi(
  id: string,
  data: UpdateSizeInput,
  token: string,
) {
  return apiClient.patch<Size>(`/sizes/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteSizeApi(id: string, token: string) {
  return apiClient.delete<Size>(`/sizes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Management Style CRUD
export async function createStyleApi(data: CreateStyleInput, token: string) {
  return apiClient.post<Style>('/styles', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateStyleApi(
  id: string,
  data: UpdateStyleInput,
  token: string,
) {
  return apiClient.patch<Style>(`/styles/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteStyleApi(id: string, token: string) {
  return apiClient.delete<Style>(`/styles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Management Order Status Update
export async function updateOrderStatusApi(
  id: string,
  status: OrderStatus,
  token: string,
) {
  return apiClient.patch<Order>(
    `/orders/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

// Management User Administration
export async function getUsersApi(params: UserQueryParams, token: string) {
  return apiClient.get<PaginatedList<User>>('/users', {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      ...(params.search ? { search: params.search } : {}),
      ...(params.role ? { role: params.role } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getUserByIdApi(id: string, token: string) {
  return apiClient.get<User>(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createUserApi(data: CreateUserInput, token: string) {
  return apiClient.post<User>('/users', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateUserApi(
  id: string,
  data: UpdateUserInput,
  token: string,
) {
  return apiClient.patch<User>(`/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateUserStatusApi(
  id: string,
  status: UserStatus,
  token: string,
) {
  return apiClient.patch<User>(
    `/users/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function updateUserRoleApi(
  id: string,
  roleCode: RoleCode,
  token: string,
) {
  return apiClient.patch<User>(
    `/users/${id}/role`,
    { roleCode },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function getRolesApi(token: string) {
  return apiClient.get<Role[]>('/users/roles', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
