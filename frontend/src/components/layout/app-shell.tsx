import type { ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#f5f0e8,_#ebe4d8_45%,_#e7efe8)] text-stone-900">
      <header className="border-b border-stone-900/10 bg-white/50 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
              Easy Fashion Limited
            </p>
            <p className="text-lg font-semibold tracking-tight">
              Assessment Platform
            </p>
          </div>
          <p className="rounded-full border border-stone-900/10 bg-white/70 px-3 py-1 text-xs font-medium text-stone-600">
            Phase 0 Foundation
          </p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-stone-900/10 bg-white/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-stone-600 sm:px-6">
          Foundation ready for customer storefront and management dashboard
          phases.
        </div>
      </footer>
    </div>
  );
}
