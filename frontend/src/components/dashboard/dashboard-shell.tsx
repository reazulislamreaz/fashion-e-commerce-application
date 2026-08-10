'use client';

import { useState, type ReactNode } from 'react';
import { DashboardGuard } from './dashboard-guard';
import { DashboardHeader } from './dashboard-header';
import { DashboardSidebar } from './dashboard-sidebar';
import { IconX } from '@/components/ui/icons';

type DashboardShellProps = {
  children: ReactNode;
  allowedRoles?: Array<'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'>;
};

export function DashboardShell({
  children,
  allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <DashboardGuard allowedRoles={allowedRoles}>
      <div className="flex min-h-screen w-full bg-[#FAFAFA] font-sans text-stone-900">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex shrink-0">
          <DashboardSidebar />
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-stone-900 text-white shadow-2xl flex flex-col justify-between z-50">
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-stone-400 hover:text-white"
                >
                  <IconX className="size-5" />
                </button>
              </div>
              <DashboardSidebar onNavClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex flex-1 flex-col min-w-0">
          <DashboardHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
