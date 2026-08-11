'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER'>;
};

export function ProtectedRoute({
  children,
  allowedRoles = ['CUSTOMER'],
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const userRole = user?.role?.code;
  const isRoleAllowed =
    userRole && allowedRoles.includes(userRole as 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (!isRoleAllowed) {
        if (['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(userRole || '')) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      }
    }
  }, [isLoading, isAuthenticated, isRoleAllowed, userRole, router, pathname]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-stone-200 border-t-[#C9A227]" />
          <p className="text-xs font-semibold text-stone-500">
            Verifying account authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isRoleAllowed) {
    return null;
  }

  return <>{children}</>;
}
