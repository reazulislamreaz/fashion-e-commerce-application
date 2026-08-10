'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { IconArrowRight, IconCheck } from '@/components/ui/icons';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center sm:px-6">
      <div className="border border-stone-200 bg-white p-8">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#C9A227] text-stone-950">
          <IconCheck className="size-10" />
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
          Order Placed Successfully!
        </h1>

        <p className="mt-2 text-xs text-stone-600 leading-relaxed">
          Thank you for shopping with Easy Fashion Limited. Your order has been registered in our system and is being processed.
        </p>

        {orderId && (
          <div className="mt-6 border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Order Reference ID
            </p>
            <p className="mt-1 text-sm font-mono font-bold text-stone-950">
              {orderId}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/products"
            className="flex w-full items-center justify-center gap-2 bg-stone-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
          >
            <span>Continue Shopping</span>
            <IconArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
