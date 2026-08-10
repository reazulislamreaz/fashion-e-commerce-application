import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalCategories, totalProducts, totalOrders] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.category.count(),
        this.prisma.product.count(),
        this.prisma.order.count(),
      ]);

    return {
      totalUsers,
      totalCategories,
      totalProducts,
      totalOrders,
    };
  }
}
