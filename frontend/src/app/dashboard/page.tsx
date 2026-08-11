'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import { getDashboardStatsApi, getMyOrdersApi } from '@/lib/api/services';
import { DashboardStats, Order } from '@/types';
import {
  IconArrowRight,
  IconBag,
  IconGrid,
  IconTag,
  IconUsers,
} from '@/components/ui/icons';

function DashboardOverviewContent() {
  const { accessToken } = useAuth();

  // Summary Metrics State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // Recent Orders State
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!accessToken) return;
    setStatsLoading(true);
    setStatsError(false);

    try {
      const statsData = await getDashboardStatsApi(accessToken);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  }, [accessToken]);

  const fetchOrders = useCallback(async () => {
    if (!accessToken) return;
    setOrdersLoading(true);
    setOrdersError(false);

    try {
      const ordersData = await getMyOrdersApi(accessToken, 1, 5);
      setRecentOrders(ordersData.items || []);
    } catch (err) {
      console.error('Failed to fetch recent orders:', err);
      setOrdersError(true);
    } finally {
      setOrdersLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchStats();
      fetchOrders();
    }
  }, [accessToken, fetchStats, fetchOrders]);

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 uppercase">
          System Overview
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Real-time metrics and database summary across Easy Fashion e-commerce platform.
        </p>
      </div>

      {/* Summary Cards Section */}
      {statsLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-stone-200" />
          ))}
        </div>
      ) : statsError || !stats ? (
        <div className="border border-stone-200 bg-white p-8 text-center">
          <p className="text-xs font-bold text-rose-600">Failed to load system metrics.</p>
          <button
            onClick={fetchStats}
            className="mt-3 bg-stone-950 px-4 py-2 text-xs font-bold text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors cursor-pointer"
          >
            Retry Loading Metrics
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Revenue */}
          {stats.totalRevenue !== undefined && (
            <div className="border border-stone-200 bg-white p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Total Revenue
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 uppercase">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-stone-400">
                  Cumulative sales volume
                </p>
              </div>
              <div className="flex size-12 items-center justify-center bg-emerald-50 text-emerald-600">
                <span className="text-xl font-bold">$</span>
              </div>
            </div>
          )}

          {/* Card 2: Total Users */}
          <div className="border border-stone-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Users
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 uppercase">
                {stats.totalUsers}
              </p>
              <p className="mt-1 text-[11px] font-medium text-stone-400">
                Registered customers & staff
              </p>
            </div>
            <div className="flex size-12 items-center justify-center bg-amber-50 text-[#C9A227]">
              <IconUsers className="size-6" />
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="border border-stone-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Orders
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 uppercase">
                {stats.totalOrders}
              </p>
              <p className="mt-1 text-[11px] font-medium text-stone-400">
                {stats.pendingOrders !== undefined ? `${stats.pendingOrders} pending processing` : 'Customer orders'}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center bg-purple-50 text-purple-600">
              <IconBag className="size-6" />
            </div>
          </div>

          {/* Card 4: Total Products */}
          <div className="border border-stone-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Products
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 uppercase">
                {stats.totalProducts}
              </p>
              <p className="mt-1 text-[11px] font-medium text-stone-400">
                Items in product database
              </p>
            </div>
            <div className="flex size-12 items-center justify-center bg-[#C9A227]/10 text-[#C9A227]">
              <IconGrid className="size-6" />
            </div>
          </div>

          {/* Card 5: Categories */}
          <div className="border border-stone-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Categories
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 uppercase">
                {stats.totalCategories}
              </p>
              <p className="mt-1 text-[11px] font-medium text-stone-400">
                Active catalog categories
              </p>
            </div>
            <div className="flex size-12 items-center justify-center bg-blue-50 text-blue-600">
              <IconTag className="size-6" />
            </div>
          </div>

          {/* Card 6: Available Sizes & Styles */}
          {stats.totalSizes !== undefined && stats.totalStyles !== undefined && (
            <div className="border border-stone-200 bg-white p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Sizes & Styles
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 uppercase">
                  {stats.totalSizes} / {stats.totalStyles}
                </p>
                <p className="mt-1 text-[11px] font-medium text-stone-400">
                  Available garment options
                </p>
              </div>
              <div className="flex size-12 items-center justify-center bg-stone-100 text-stone-700">
                <span className="text-xs font-extrabold">S/M/L</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-950">
              Recent Orders
            </h2>
            <p className="text-xs text-stone-500">
              Latest customer purchases placed in the platform.
            </p>
          </div>

          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1 text-xs font-bold text-[#C9A227] hover:underline"
          >
            <span>View All Orders</span>
            <IconArrowRight className="size-3" />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="h-40 animate-pulse bg-stone-100" />
        ) : ordersError ? (
          <div className="py-8 text-center text-xs text-stone-500">
            <p>Unable to load recent orders right now.</p>
            <button
              onClick={fetchOrders}
              className="mt-2 text-[#C9A227] font-bold hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="py-8 text-center text-xs text-stone-500">
            No recent orders recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 uppercase text-[10px] font-bold tracking-wider text-stone-500 border-y border-stone-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {recentOrders.map((order) => {
                  const formattedDate = new Date(order.createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' },
                  );
                  const totalNum =
                    typeof order.totalAmount === 'string'
                      ? parseFloat(order.totalAmount)
                      : order.totalAmount;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-950">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="py-3 px-4">{order.customerName}</td>
                      <td className="py-3 px-4 text-stone-500">{formattedDate}</td>
                      <td className="py-3 px-4 font-bold text-stone-950">
                        ${totalNum.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-800 border border-stone-200">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="font-bold text-[#C9A227] hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardOverviewContent />
    </DashboardShell>
  );
}
