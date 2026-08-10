'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { IconLock } from '@/components/ui/icons';

type DashboardGuardProps = {
  children: ReactNode;
  allowedRoles?: Array<'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'>;
};

export function DashboardGuard({
  children,
  allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
}: DashboardGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const userRole = user?.role?.code;
  const isRoleAllowed =
    userRole && allowedRoles.includes(userRole as 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-stone-100 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-10 animate-spin rounded-full border-4 border-stone-300 border-t-[#C9A227]" />
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Verifying Dashboard Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isRoleAllowed) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-stone-100 p-6 text-stone-900">
        <div className="w-full max-w-md border border-stone-200 bg-white p-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center bg-rose-50 text-rose-600 mb-4">
            <IconLock className="size-8" />
          </div>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-rose-700">
            403 — Access Denied
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
            Restricted Dashboard
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-stone-500">
            Your current account role (<strong className="text-stone-800">{userRole || 'Customer'}</strong>) does not have authorization to access the Management Dashboard.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full bg-stone-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
            >
              Return to Storefront
            </Link>
            <Link
              href="/login?redirect=/dashboard"
              className="w-full border border-stone-300 bg-white py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Sign In with Management Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
