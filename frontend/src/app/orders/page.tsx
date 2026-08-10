'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getMyOrdersApi } from '@/lib/api/services';
import { Order, PaginatedList } from '@/types';
import { IconBag, IconChevronRight } from '@/components/ui/icons';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const [ordersData, setOrdersData] = useState<PaginatedList<Order>>({
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }

    if (accessToken) {
      const activeToken = accessToken;
      const fetchOrders = async (t: string) => {
        setLoading(true);
        try {
          const res = await getMyOrdersApi(t, 1, 20);
          setOrdersData(res);
        } catch {
          setOrdersData({
            items: [],
            pagination: {
              page: 1,
              limit: 10,
              totalItems: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        } finally {
          setLoading(false);
        }
      }

      fetchOrders(activeToken);
    }
  }, [accessToken, isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-stone-200" />
        <div className="mt-8 flex flex-col gap-4">
          <div className="h-24 w-full animate-pulse rounded-2xl bg-stone-200" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-stone-200" />
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROCESSING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SHIPPED':
        return 'bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/30';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl font-extrabold text-stone-950 font-display">
          My Order History
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500">
          Track your past purchases, shipment statuses, and historical pricing snapshots.
        </p>
      </div>

      {ordersData.items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <IconBag className="size-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-stone-900">
            No Orders Placed Yet
          </h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm">
            Once you place an order on Easy Fashion, it will appear here with live delivery status.
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-xl bg-stone-950 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
          >
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {ordersData.items.map((order) => {
            const totalNum =
              typeof order.totalAmount === 'string'
                ? parseFloat(order.totalAmount)
                : order.totalAmount;

            const formattedDate = new Date(order.createdAt).toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              },
            );

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs hover:border-[#C9A227]/50 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-stone-950 font-display">
                      Order #{order.id.substring(0, 8)}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-stone-500">
                    Placed on {formattedDate} • {order.items?.length || 0} items
                  </p>
                  <p className="mt-0.5 text-xs text-stone-600 line-clamp-1">
                    Ship to: {order.shippingAddress}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-stone-100 pt-3 sm:border-t-0 sm:pt-0">
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Total Amount</span>
                    <span className="text-base font-extrabold text-stone-950 font-display">
                      ${totalNum.toFixed(2)}
                    </span>
                  </div>

                  <span className="flex size-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 group-hover:bg-[#C9A227] group-hover:text-stone-950 transition-colors">
                    <IconChevronRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
