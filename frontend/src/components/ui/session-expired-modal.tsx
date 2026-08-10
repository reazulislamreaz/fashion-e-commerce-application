'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconLock } from './icons';

/**
 * Custom event dispatched when a session expires and cannot be refreshed.
 * Listened to by this modal to display the session-expired popup.
 */
export const SESSION_EXPIRED_EVENT = 'session:expired';

export function dispatchSessionExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
}

export function SessionExpiredModal() {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    function handleSessionExpired() {
      setOpen(true);
      setCountdown(5);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    if (countdown <= 0) {
      setOpen(false);
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, countdown, router]);

  const handleLoginNow = () => {
    setOpen(false);
    router.push('/login');
  };

  if (!open) return null;

  return (
    <div
      id="session-expired-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-desc"
    >
      <div className="w-full max-w-md mx-4 border border-stone-200 bg-white p-8 text-center animate-[fadeScaleIn_0.25s_ease-out]">
        {/* Icon */}
        <div className="mx-auto mb-5 flex size-14 items-center justify-center border border-amber-300 bg-amber-50 text-[#C9A227]">
          <IconLock className="size-6" />
        </div>

        {/* Title */}
        <h2
          id="session-expired-title"
          className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-stone-900"
        >
          Session Expired
        </h2>

        {/* Description */}
        <p
          id="session-expired-desc"
          className="mt-2 text-sm text-stone-500 leading-relaxed"
        >
          Your session has expired due to inactivity. Please log in again to
          continue.
        </p>

        {/* Countdown */}
        <p className="mt-4 text-xs text-stone-400 tracking-wide uppercase">
          Redirecting to login in{' '}
          <span className="font-semibold text-[#C9A227]">{countdown}s</span>
        </p>

        {/* CTA */}
        <button
          id="session-expired-login-btn"
          onClick={handleLoginNow}
          className="mt-6 w-full cursor-pointer bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-[#C9A227]"
        >
          Log In Now
        </button>
      </div>
    </div>
  );
}
