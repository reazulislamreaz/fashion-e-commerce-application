'use client';

import { useEffect, useState } from 'react';
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboardData = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(false);

    try {
      const [statsData, ordersData] = await Promise.all([
        getDashboardStatsApi(accessToken),
        getMyOrdersApi(accessToken, 1, 5),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.items || []);
    } catch {
      setError(true);
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      getDashboardStatsApi(accessToken)
        .then((s) => setStats(s))
        .catch(() => setError(true));

      getMyOrdersApi(accessToken, 1, 5)
        .then((o) => setRecentOrders(o.items || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-stone-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-stone-200" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-xs">
        <h3 className="text-lg font-bold text-stone-900">Unable to load dashboard data</h3>
        <p className="mt-1 text-xs text-stone-500">
          Ensure your management session is valid and server connection is active.
        </p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded-xl bg-stone-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-stone-950 font-display">
          System Overview
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Real-time metrics and database summary across Easy Fashion e-commerce platform.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Users */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Users
            </p>
            <p className="mt-1 text-3xl font-extrabold text-stone-950 font-display">
              {stats.totalUsers}
            </p>
            <p className="mt-1 text-[11px] font-medium text-stone-400">
              Registered customers & staff
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-[#C9A227]">
            <IconUsers className="size-6" />
          </div>
        </div>

        {/* Card 2: Total Categories */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Categories
            </p>
            <p className="mt-1 text-3xl font-extrabold text-stone-950 font-display">
              {stats.totalCategories}
            </p>
            <p className="mt-1 text-[11px] font-medium text-stone-400">
              Active catalog categories
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <IconTag className="size-6" />
          </div>
        </div>

        {/* Card 3: Total Products */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Products
            </p>
            <p className="mt-1 text-3xl font-extrabold text-stone-950 font-display">
              {stats.totalProducts}
            </p>
            <p className="mt-1 text-[11px] font-medium text-stone-400">
              Items in product database
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <IconGrid className="size-6" />
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Orders
            </p>
            <p className="mt-1 text-3xl font-extrabold text-stone-950 font-display">
              {stats.totalOrders}
            </p>
            <p className="mt-1 text-[11px] font-medium text-stone-400">
              Customer orders generated
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <IconBag className="size-6" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-950 font-display">
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

        {recentOrders.length === 0 ? (
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
