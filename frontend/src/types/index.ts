export type RoleCode = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

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
  id: string;
  productId: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
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
