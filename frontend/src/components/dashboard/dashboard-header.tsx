'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { IconArrowRight, IconMenu } from '@/components/ui/icons';

type DashboardHeaderProps = {
  onOpenMobileMenu: () => void;
};

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const { user } = useAuth();

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'EF';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-stone-600 hover:text-stone-900 lg:hidden"
          aria-label="Open Mobile Menu"
        >
          <IconMenu className="size-6" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <span className="hidden sm:inline">Easy Fashion Limited</span>
          <span className="hidden sm:inline text-stone-300">•</span>
          <span className="text-stone-900 font-bold">Management Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Customer Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:border-[#C9A227] hover:bg-white transition-all"
        >
          <span>View Customer Storefront</span>
          <IconArrowRight className="size-3 text-stone-400" />
        </Link>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2.5 rounded-full border border-stone-200 bg-stone-50 py-1 pl-1 pr-3">
            <div className="flex size-7 items-center justify-center rounded-full bg-stone-950 font-extrabold text-xs text-[#C9A227]">
              {userInitials}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-stone-900 leading-none">
                {user.fullName.split(' ')[0]}
              </span>
              <span className="text-[9px] font-semibold text-[#96740c] uppercase">
                {user.role?.name || user.role?.code}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
