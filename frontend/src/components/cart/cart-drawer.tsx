'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { IconBag, IconMinus, IconPlus, IconTrash, IconX } from '../ui/icons';

export function CartDrawer() {
  const {
    items,
    subtotal,
    itemCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-stone-900/60 transition-opacity backdrop-blur-xs"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-900 text-white">
            <div className="flex items-center gap-2">
              <IconBag className="size-5 text-[#C9A227]" />
              <h2 className="text-base font-semibold tracking-tight">Your Cart</h2>
              <span className="ml-1 rounded-full bg-[#C9A227] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-stone-950">
                {itemCount}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="rounded-full p-1 text-stone-400 hover:bg-stone-800 hover:text-white cursor-pointer"
            >
              <IconX className="size-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                  <IconBag className="size-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  Your cart is empty
                </h3>
                <p className="mt-1 text-sm text-stone-500 max-w-xs">
                  Discover our latest fashion collections and add items to your cart.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 cursor-pointer"
                >
                  Explore Shop
                </button>
              </div>
            ) : (
              items.map((item) => {
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
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden border border-stone-200 bg-stone-100">
                      <Image
                        src={primaryImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-stone-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="text-sm font-bold text-stone-900">
                            ${(priceNum * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {item.sizeName && (
                          <span className="mt-1 inline-block bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                            Size: {item.sizeName}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border border-stone-200 bg-stone-50">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.sizeId,
                                item.quantity - 1,
                              )
                            }
                            className="p-1.5 text-stone-600 hover:text-stone-900"
                          >
                            <IconMinus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-stone-900">
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
                            className="p-1.5 text-stone-600 hover:text-stone-900"
                          >
                            <IconPlus className="size-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.sizeId)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <IconTrash className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 bg-stone-50 p-6">
              <div className="flex items-center justify-between text-base font-semibold text-stone-900">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Taxes and shipping calculated during checkout.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center border border-stone-300 bg-white px-6 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
