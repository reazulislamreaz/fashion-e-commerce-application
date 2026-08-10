'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/components/ui/toast';
import { createOrderApi } from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/api/errors';
import { IconArrowRight } from '@/components/ui/icons';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill fields if customer is logged in
  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.phone) setPhoneNumber(user.phone);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
          Your Cart is Empty
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Please add items to your shopping cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 bg-stone-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
        >
          Browse Shop Catalog
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Customer Name is required');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Phone Number is required');
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMessage('Shipping Address is required');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        shippingAddress: shippingAddress.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const order = await createOrderApi(orderPayload, accessToken || undefined);

      clearCart();
      showToast('Order Placed Successfully', `Order #${order.id.substring(0, 8)} has been generated.`);
      router.push(isAuthenticated ? `/orders/${order.id}` : `/orders/success?id=${order.id}`);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Failed to place order. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase border-b border-stone-200 pb-4">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Customer Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {!isAuthenticated && (
            <div className="border border-amber-400/40 bg-amber-400/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-900">Have an account?</p>
                <p className="text-xs text-stone-600">
                  Log in to track your order history and manage your profile.
                </p>
              </div>
              <Link
                href="/login?redirect=/checkout"
                className="bg-stone-950 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          <form
            onSubmit={handleSubmitOrder}
            className="flex flex-col gap-6 border border-stone-200 bg-white p-6"
          >
            <h2 className="text-lg font-bold tracking-tight text-stone-950 font-display uppercase border-b border-stone-100 pb-3">
              Shipping & Customer Information
            </h2>

            {errorMessage && (
              <div className="border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Full Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John Doe"
                className="border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +880 1711-223344"
                className="border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Shipping Address *
              </label>
              <textarea
                required
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Street address, apartment, city, postal code..."
                className="border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
              />
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 bg-stone-950 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Place Order — ${subtotal.toFixed(2)}</span>
                    <IconArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Items Preview */}
        <div className="h-fit border border-stone-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold tracking-tight text-stone-950 font-display uppercase border-b border-stone-100 pb-3">
            Order Review
          </h2>

          <div className="flex flex-col divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => {
              const priceNum =
                typeof item.product.price === 'string'
                  ? parseFloat(item.product.price)
                  : item.product.price;

              return (
                <div
                  key={`${item.productId}-${item.sizeId}`}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-900 line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Qty: {item.quantity}{' '}
                      {item.sizeName ? `• Size: ${item.sizeName}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-950">
                    ${(priceNum * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-stone-200 pt-4 flex flex-col gap-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-stone-950 border-t border-stone-200 pt-2">
              <span>Total</span>
              <span className="text-base font-display text-stone-950">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
