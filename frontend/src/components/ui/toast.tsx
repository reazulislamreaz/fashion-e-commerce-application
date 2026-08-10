'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { IconCheck, IconX } from './icons';

type ToastMessage = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
};

type ToastContextType = {
  showToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    description?: string,
    type: 'success' | 'error' | 'info' = 'success',
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start justify-between  border p-4  transition-all backdrop-blur-md ${
              toast.type === 'success'
                ? 'border-amber-400/40 bg-stone-900/95 text-white'
                : toast.type === 'error'
                ? 'border-rose-400/40 bg-rose-950/95 text-rose-100'
                : 'border-stone-400/40 bg-stone-900/95 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === 'success' && (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#C9A227] text-stone-900">
                  <IconCheck className="size-3.5" />
                </span>
              )}
              <div>
                <p className="text-sm font-semibold tracking-tight">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-stone-300">{toast.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              className="ml-2 text-stone-400 hover:text-white"
            >
              <IconX className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
