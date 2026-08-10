import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, RoleCode } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { NotFoundError, ValidationError } from '@/common/errors/app.errors';
import { buildPaginationMeta, PaginatedResult } from '@/common/utils/pagination.util';
import { AuthUser } from '@/modules/auth/types/auth.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';

const ORDER_SORT_FIELDS = ['createdAt', 'updatedAt', 'totalAmount', 'status'] as const;
type OrderSortField = (typeof ORDER_SORT_FIELDS)[number];

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

export const ORDER_INCLUDE: Prisma.OrderInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          isActive: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              url: true,
            },
          },
        },
      },
    },
  },
};

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateOrderDto): Promise<OrderWithRelations> {
    const productIds = dto.items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      throw new ValidationError(
        'Duplicate product IDs in order items are not allowed.',
      );
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new ValidationError('One or more products were not found.');
    }

    const inactiveProduct = products.find((p) => !p.isActive);
    if (inactiveProduct) {
      throw new ValidationError(
        `Product '${inactiveProduct.name}' is inactive and cannot be ordered.`,
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = new Prisma.Decimal(0);
    const calculatedItems = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = new Prisma.Decimal(product.price);
      const subtotal = unitPrice.mul(item.quantity);
      totalAmount = totalAmount.add(subtotal);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          customerName: dto.customerName,
          phoneNumber: dto.phoneNumber,
          shippingAddress: dto.shippingAddress,
          totalAmount,
          status: OrderStatus.PENDING,
          items: {
            createMany: {
              data: calculatedItems,
            },
          },
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: ORDER_INCLUDE,
      });
    });
  }

  async findAll(
    user: AuthUser,
    query: OrderQueryDto,
  ): Promise<PaginatedResult<OrderWithRelations>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(user, query);
    const orderBy = this.buildOrderBy(query);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string, user: AuthUser): Promise<OrderWithRelations> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    if (user.role.code === RoleCode.CUSTOMER && order.userId !== user.id) {
      throw new NotFoundError('Order not found.');
    }

    return order;
  }

  async updateStatus(
    id: string,
    newStatus: OrderStatus,
  ): Promise<OrderWithRelations> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    if (order.status === newStatus) {
      return this.prisma.order.findUniqueOrThrow({
        where: { id },
        include: ORDER_INCLUDE,
      });
    }

    const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new ValidationError(
        `Invalid order status transition from ${order.status} to ${newStatus}.`,
      );
    }

    await this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });

    return this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: ORDER_INCLUDE,
    });
  }

  private buildWhere(user: AuthUser, query: OrderQueryDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (user.role.code === RoleCode.CUSTOMER) {
      where.userId = user.id;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    if (query.search) {
      const search = query.search;
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          search,
        );

      where.OR = [
        ...(isUuid ? [{ id: search }] : []),
        { customerName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private buildOrderBy(
    query: OrderQueryDto,
  ): Prisma.OrderOrderByWithRelationInput {
    const requested = query.sortBy ?? 'createdAt';
    const field: OrderSortField = ORDER_SORT_FIELDS.includes(
      requested as OrderSortField,
    )
      ? (requested as OrderSortField)
      : 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    return { [field]: sortOrder };
  }
}
