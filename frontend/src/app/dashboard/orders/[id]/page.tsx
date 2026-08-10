'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import { getOrderByIdApi, updateOrderStatusApi } from '@/lib/api/services';
import { Order, OrderStatus } from '@/types';
import { IconArrowRight } from '@/components/ui/icons';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function DashboardOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { accessToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!accessToken) return;
      setLoading(true);
      try {
        const res = await getOrderByIdApi(id, accessToken);
        setOrder(res);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch order details');
        }
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, accessToken]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!accessToken || !order) return;
    setUpdating(true);

    try {
      const updated = await updateOrderStatusApi(id, newStatus, accessToken);
      setOrder(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>
        <div className="flex h-64 items-center justify-center text-xs text-stone-500">
          Loading order detail...
        </div>
      </DashboardShell>
    );
  }

  if (error || !order) {
    return (
      <DashboardShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>
        <div className="border border-stone-200 bg-white p-12 text-center">
          <h3 className="text-base font-bold text-stone-900">Order Not Found</h3>
          <p className="mt-1 text-xs text-stone-500">{error || 'Invalid order ID'}</p>
          <Link
            href="/dashboard/orders"
            className="mt-4 inline-block bg-stone-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
          >
            Back to Orders List
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const grandTotalNum =
    typeof order.totalAmount === 'string'
      ? parseFloat(order.totalAmount)
      : order.totalAmount;

  const formattedDate = new Date(order.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <DashboardShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
              <Link href="/dashboard/orders" className="hover:underline">
                Orders
              </Link>
              <IconArrowRight className="size-3" />
              <span className="text-stone-900 font-bold">Order Details</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
              Order #{order.id.substring(0, 8)}
            </h1>
            <p className="text-xs text-stone-500">Placed on {formattedDate}</p>
          </div>

          {/* Status Changer */}
          <div className="flex items-center gap-3 border border-stone-200 bg-white p-3">
            <span className="text-xs font-bold text-stone-700">Order Status:</span>
            <select
              disabled={updating}
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="border border-stone-300 bg-stone-50 py-1.5 px-3 text-xs font-extrabold text-stone-900 focus:border-[#C9A227] focus:outline-none disabled:opacity-50"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer & Shipping Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="border border-stone-200 bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Customer Information
            </h3>
            <p className="text-sm font-bold text-stone-950">{order.customerName}</p>
            <p className="mt-1 text-xs text-stone-600">Phone: {order.phoneNumber}</p>
            <p className="mt-0.5 text-xs text-stone-500">User Account ID: {order.userId}</p>
          </div>

          <div className="border border-stone-200 bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Shipping Destination
            </h3>
            <p className="text-xs leading-relaxed font-medium text-stone-800">
              {order.shippingAddress}
            </p>
          </div>
        </div>

        {/* Line Items Snapshot */}
        <div className="border border-stone-200 bg-white p-6">
          <h2 className="text-base font-bold text-stone-950 font-display border-b border-stone-100 pb-3 mb-4">
            Ordered Line Items ({order.items.length})
          </h2>

          <div className="divide-y divide-stone-100">
            {order.items.map((item) => {
              const unitPriceNum =
                typeof item.unitPrice === 'string'
                  ? parseFloat(item.unitPrice)
                  : item.unitPrice;
              const subtotalNum =
                typeof item.subtotal === 'string'
                  ? parseFloat(item.subtotal)
                  : item.subtotal;

              const imgUrl =
                item.product?.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200';

              return (
                <div key={item.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative size-12 shrink-0 overflow-hidden border border-stone-200 bg-stone-100">
                      <Image
                        src={imgUrl}
                        alt={item.product?.name || 'Product'}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-950">
                        {item.product?.name || 'Garment Item'}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Unit Snapshot: ${unitPriceNum.toFixed(2)} × {item.quantity} qty
                      </p>
                    </div>
                  </div>

                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
                    ${subtotalNum.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="border-t border-stone-200 pt-4 mt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">Authoritative Server Total</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
              ${grandTotalNum.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
