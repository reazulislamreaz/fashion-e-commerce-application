'use client';

import { type ReactNode } from 'react';

export type BadgeVariant =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'CUSTOMER'
  | 'default';

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  showDot?: boolean;
  className?: string;
};

export function Badge({
  variant = 'default',
  children,
  showDot = false,
  className = '',
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
    PENDING: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    CONFIRMED: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500',
    },
    PROCESSING: {
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      dot: 'bg-purple-500',
    },
    SHIPPED: {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      dot: 'bg-indigo-500',
    },
    DELIVERED: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    CANCELLED: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
    },
    ACTIVE: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    INACTIVE: {
      bg: 'bg-stone-100 text-stone-600 border-stone-200',
      dot: 'bg-stone-400',
    },
    SUPER_ADMIN: {
      bg: 'bg-[#C9A227]/20 text-[#96740c] border-[#C9A227]/30',
      dot: 'bg-[#C9A227]',
    },
    ADMIN: {
      bg: 'bg-stone-900 text-white border-stone-800',
      dot: 'bg-[#C9A227]',
    },
    MANAGER: {
      bg: 'bg-slate-100 text-slate-800 border-slate-200',
      dot: 'bg-slate-500',
    },
    CUSTOMER: {
      bg: 'bg-stone-100 text-stone-700 border-stone-200',
      dot: 'bg-stone-500',
    },
    default: {
      bg: 'bg-stone-100 text-stone-800 border-stone-200',
      dot: 'bg-stone-500',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.bg} ${className}`}
    >
      {showDot && <span className={`size-1.5 rounded-full ${style.dot}`} />}
      <span>{children}</span>
    </span>
  );
}
