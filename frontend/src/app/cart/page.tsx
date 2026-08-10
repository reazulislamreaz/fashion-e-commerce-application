'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { IconBag, IconMinus, IconPlus, IconTrash, IconArrowRight } from '@/components/ui/icons';

export default function CartPage() {
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <IconBag className="size-10" />
        </div>
        <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
          Your Shopping Cart is Empty
        </h1>
        <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
          Explore our fashion collections to add high-quality tailored apparel and seasonal styles to your cart.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-stone-950 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
          >
            <span>Explore Shop Catalog</span>
            <IconArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
            Shopping Cart
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Review your selected fashion items ({itemCount} {itemCount === 1 ? 'item' : 'items'}).
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
        >
          Clear Entire Cart
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => {
            const primaryImage =
              item.product.images?.find((img) => img.isPrimary)?.url ||
              item.product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80';

            const priceNum =
              typeof item.product.price === 'string'
                ? parseFloat(item.product.price)
                : item.product.price;

            return (
              <div
                key={`${item.productId}-${item.sizeId || 'nosize'}`}
                className="flex gap-4 sm:gap-6 border border-stone-200 bg-white p-4 sm:p-5"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="relative size-24 sm:size-28 shrink-0 overflow-hidden border border-stone-200 bg-stone-100"
                >
                  <Image
                    src={primaryImage}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="text-base font-bold text-stone-900 hover:text-[#C9A227] transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
                        ${(priceNum * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {item.sizeName && (
                      <span className="mt-1 inline-block bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                        Size: {item.sizeName}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-stone-300 bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.sizeId,
                            item.quantity - 1,
                          )
                        }
                        className="p-2 text-stone-600 hover:text-stone-900"
                      >
                        <IconMinus className="size-4" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold uppercase tracking-wider text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.sizeId,
                            item.quantity + 1,
                          )
                        }
                        className="p-2 text-stone-600 hover:text-stone-900"
                      >
                        <IconPlus className="size-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.sizeId)}
                      className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      <IconTrash className="size-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="h-fit border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold tracking-tight text-stone-950 font-display uppercase border-b border-stone-100 pb-4">
            Order Summary
          </h2>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-stone-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-extrabold text-stone-950">
              <span>Grand Total</span>
              <span className="text-xl font-display text-stone-950">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 bg-stone-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
            >
              <span>Proceed to Checkout</span>
              <IconArrowRight className="size-4" />
            </Link>
            <Link
              href="/products"
              className="text-center text-xs font-semibold text-stone-600 hover:text-stone-950 py-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
