import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { ToastProvider } from '../ui/toast';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CartDrawer } from '../cart/cart-drawer';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-stone-900 selection:bg-[#C9A227] selection:text-stone-950">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <CartDrawer />
          </div>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
