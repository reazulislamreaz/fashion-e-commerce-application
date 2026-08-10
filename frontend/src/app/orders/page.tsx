'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';
import { getMyOrdersApi } from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/api/errors';
import { Order, PaginatedList } from '@/types';
import { IconBag, IconChevronRight } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';

function CustomerOrdersContent() {
  const { accessToken } = useAuth();

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
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (accessToken) {
      const activeToken = accessToken;
      const fetchOrders = async (t: string) => {
        setLoading(true);
        try {
          const res = await getMyOrdersApi(t, page, 10);
          setOrdersData(res);
        } catch (err) {
          console.error('Failed to load customer orders:', extractErrorMessage(err));
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
      };

      fetchOrders(activeToken);
    }
  }, [accessToken, page]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 text-center">
        <div className="h-8 w-48 animate-pulse bg-stone-200 mx-auto" />
        <div className="mt-6 h-64 w-full animate-pulse bg-stone-200" />
      </div>
    );
  }

  const orders = Array.isArray(ordersData)
    ? ordersData
    : ordersData?.items || [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-stone-900">
          Home
        </Link>
        <IconChevronRight className="size-3" />
        <span className="text-stone-900 font-semibold">My Orders</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
            Order History
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            View status and details of your past customer orders.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="border border-stone-200 bg-white p-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center bg-stone-100 text-stone-400">
            <IconBag className="size-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-stone-950">No Orders Found</h3>
          <p className="mt-1 text-xs text-stone-500">
            You haven&apos;t placed any fashion orders yet.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 bg-stone-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              },
            );

            const totalNum =
              typeof order.totalAmount === 'string'
                ? parseFloat(order.totalAmount)
                : order.totalAmount;

            return (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-stone-200 bg-white p-5 hover:border-stone-400 hover: transition-all"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-stone-950">
                      Order #{order.id.substring(0, 8)}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-700">
                      {order.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500">
                    Placed on {formattedDate} • {order.items?.length || 0} Item(s)
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-900 mt-1">
                    Total: ${totalNum.toFixed(2)}
                  </p>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center justify-center bg-stone-950 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
                >
                  View Order Details
                </Link>
              </div>
            );
          })}

          <Pagination
            meta={ordersData?.pagination || null}
            onPageChange={setPage}
            noun="orders"
            variant="standalone"
          />
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <ProtectedRoute>
      <CustomerOrdersContent />
    </ProtectedRoute>
  );
}
