export type RoleCode = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type Role = {
  id: string;
  code: RoleCode;
  name: string;
  description?: string | null;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  status: UserStatus;
  role: {
    id: string;
    code: RoleCode;
    name: string;
    description?: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Style = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Size = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductImage = {
  id?: string;
  productId?: string;
  url: string;
  sortOrder?: number;
  isPrimary?: boolean;
  createdAt?: string;
};

export type ProductSizeRelation = {
  id: string;
  productId: string;
  sizeId: string;
  size: Size;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  categoryId: string;
  styleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
  style: Style;
  productSizes: ProductSizeRelation[];
  images: ProductImage[];
};

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  product?: {
    id: string;
    name: string;
    description?: string;
    images?: ProductImage[];
  };
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  phoneNumber: string;
  shippingAddress: string;
  totalAmount: number | string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedList<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type AuthResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type CartItem = {
  productId: string;
  product: Product;
  sizeId?: string;
  sizeName?: string;
  quantity: number;
};

export type DashboardStats = {
  totalUsers: number;
  totalCategories: number;
  totalProducts: number;
  totalOrders: number;
};

export type CreateProductInput = {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  styleId: string;
  sizeIds: string[];
  images: Array<{
    url: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
};

export type UpdateProductInput = Partial<CreateProductInput> & {
  isActive?: boolean;
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  isActive?: boolean;
};

export type CreateSizeInput = {
  name: string;
  sortOrder?: number;
};

export type UpdateSizeInput = Partial<CreateSizeInput> & {
  isActive?: boolean;
};

export type CreateStyleInput = {
  name: string;
  description?: string;
};

export type UpdateStyleInput = Partial<CreateStyleInput> & {
  isActive?: boolean;
};

export type CreateUserInput = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  roleCode: RoleCode;
};

export type UpdateUserInput = {
  fullName?: string;
  email?: string;
  phone?: string;
};

export type UserQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: RoleCode;
  status?: UserStatus;
};
