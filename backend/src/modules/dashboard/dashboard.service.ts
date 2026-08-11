import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DashboardService {
  private cachedStats: Record<string, number> | null = null;
  private cachedAt = 0;
  private readonly CACHE_TTL_MS = 15_000; // 15 seconds

  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = Date.now();
    if (this.cachedStats && now - this.cachedAt < this.CACHE_TTL_MS) {
      return this.cachedStats;
    }

    const [
      totalUsers,
      totalCategories,
      totalProducts,
      totalOrders,
      totalSizes,
      totalStyles,
      pendingOrders,
      totalRevenueRaw,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.category.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.size.count(),
      this.prisma.style.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

    const totalRevenue = totalRevenueRaw._sum.totalAmount
      ? Number(totalRevenueRaw._sum.totalAmount)
      : 0;

    const stats = {
      totalUsers,
      totalCategories,
      totalProducts,
      totalOrders,
      totalSizes,
      totalStyles,
      pendingOrders,
      totalRevenue,
    };

    this.cachedStats = stats;
    this.cachedAt = now;

    return stats;
  }

  clearCache() {
    this.cachedStats = null;
    this.cachedAt = 0;
  }
}
