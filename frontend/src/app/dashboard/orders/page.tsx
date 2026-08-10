'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import { getMyOrdersApi, updateOrderStatusApi } from '@/lib/api/services';
import { Order, OrderStatus, PaginationMeta } from '@/types';
import {
  IconChevronLeft,
  IconChevronRight,
  IconEye,
} from '@/components/ui/icons';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function DashboardOrdersPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrdersList = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await getMyOrdersApi(
        accessToken,
        page,
        10,
        statusFilter || undefined,
      );
      setOrders(res.items || []);
      setMeta(res.pagination || null);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, statusFilter]);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!accessToken) return;
    setUpdatingId(orderId);

    try {
      await updateOrderStatusApi(orderId, newStatus, accessToken);
      fetchOrdersList();
    } catch {
      // Ignore
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-950 font-display">
              Order Management
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Inspect order details, verify line items, and update fulfillment statuses.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-700">Status Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | '');
                setPage(1);
              }}
              className="rounded-xl border border-stone-200 bg-stone-50 py-2 px-3 text-xs font-medium text-stone-900 focus:border-[#C9A227] focus:bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-stone-500">
              Loading orders list...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              No orders found matching your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Update Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {orders.map((ord) => {
                    const formattedDate = new Date(ord.createdAt).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric', year: 'numeric' },
                    );

                    const totalNum =
                      typeof ord.totalAmount === 'string'
                        ? parseFloat(ord.totalAmount)
                        : ord.totalAmount;

                    return (
                      <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-stone-950">
                          #{ord.id.substring(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          {ord.customerName}
                        </td>
                        <td className="py-3.5 px-4 text-stone-500">{ord.phoneNumber}</td>
                        <td className="py-3.5 px-4 text-stone-500">{formattedDate}</td>
                        <td className="py-3.5 px-4 font-bold text-stone-950">
                          ${totalNum.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            disabled={updatingId === ord.id}
                            value={ord.status}
                            onChange={(e) =>
                              handleStatusChange(ord.id, e.target.value as OrderStatus)
                            }
                            className="rounded-lg border border-stone-200 bg-stone-50 py-1 px-2 text-[11px] font-bold text-stone-800 focus:border-[#C9A227] focus:outline-none disabled:opacity-50"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard/orders/${ord.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            <IconEye className="size-3.5 text-stone-500" />
                            <span>Inspect</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3 text-xs text-stone-500">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.totalItems} orders)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-stone-200 p-1.5 disabled:opacity-40"
                >
                  <IconChevronLeft className="size-4" />
                </button>
                <button
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-stone-200 p-1.5 disabled:opacity-40"
                >
                  <IconChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
