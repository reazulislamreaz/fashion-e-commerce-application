'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getOrderByIdApi } from '@/lib/api/services';
import { Order } from '@/types';
import { IconArrowRight, IconBag, IconChevronRight } from '@/components/ui/icons';

export default function OrderDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { accessToken } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!accessToken) return;
      const token = accessToken;
      setLoading(true);
      try {
        const data = await getOrderByIdApi(params.id, token);
        setOrder(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [params.id, accessToken]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 text-center">
        <div className="h-8 w-48 animate-pulse rounded bg-stone-200 mx-auto" />
        <div className="mt-6 h-64 w-full animate-pulse rounded-2xl bg-stone-200" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-stone-950">Order Not Found</h2>
        <p className="mt-2 text-xs text-stone-500">
          We could not load details for this order. Ensure you are signed into the matching account.
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-950 px-6 py-3 text-xs font-bold text-white shadow-xs"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  const totalNum =
    typeof order.totalAmount === 'string'
      ? parseFloat(order.totalAmount)
      : order.totalAmount;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-stone-900">
          Home
        </Link>
        <IconChevronRight className="size-3" />
        <Link href="/orders" className="hover:text-stone-900">
          My Orders
        </Link>
        <IconChevronRight className="size-3" />
        <span className="text-stone-900 font-semibold truncate">
          Order #{order.id.substring(0, 8)}
        </span>
      </nav>

      {/* Main Order Details Card */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">
              ORDER CONFIRMATION
            </span>
            <h1 className="text-2xl font-extrabold text-stone-950 font-display">
              Order #{order.id}
            </h1>
            <p className="mt-1 text-xs text-stone-500">Placed on {formattedDate}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stone-950 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider">
              {order.status}
            </span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Customer Information
            </h3>
            <p className="text-sm font-bold text-stone-900">{order.customerName}</p>
            <p className="text-xs text-stone-600">Phone: {order.phoneNumber}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Shipping Address
            </h3>
            <p className="text-xs leading-relaxed text-stone-700">
              {order.shippingAddress}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-stone-950 uppercase tracking-wider mb-4">
            Ordered Line Items (Historical Snapshots)
          </h3>

          <div className="flex flex-col divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
            {order.items?.map((item) => {
              const unitPriceNum =
                typeof item.unitPrice === 'string'
                  ? parseFloat(item.unitPrice)
                  : item.unitPrice;
              const subtotalNum =
                typeof item.subtotal === 'string'
                  ? parseFloat(item.subtotal)
                  : item.subtotal;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white hover:bg-stone-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
                      <IconBag className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">
                        {item.product?.name || `Product ID: ${item.productId.substring(0, 8)}`}
                      </p>
                      <p className="text-xs text-stone-500">
                        Historical Unit Price: ${unitPriceNum.toFixed(2)} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-extrabold text-stone-950 font-display">
                    ${subtotalNum.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Total */}
        <div className="mt-8 border-t border-stone-200 pt-6 flex justify-between items-center text-stone-950">
          <span className="text-base font-bold">Total Order Amount Paid</span>
          <span className="text-2xl font-extrabold font-display text-stone-950">
            ${totalNum.toFixed(2)}
          </span>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-6 py-3 text-xs font-bold text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
          >
            <span>Continue Shopping</span>
            <IconArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
