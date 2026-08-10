'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { ToastProvider } from '../ui/toast';
import { SessionExpiredModal } from '../ui/session-expired-modal';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CartDrawer } from '../cart/cart-drawer';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-stone-900 selection:bg-[#C9A227] selection:text-stone-950">
            {!isDashboard && <Navbar />}
            <main className="flex-1 flex flex-col">{children}</main>
            {!isDashboard && <Footer />}
            {!isDashboard && <CartDrawer />}
          </div>
          <SessionExpiredModal />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
