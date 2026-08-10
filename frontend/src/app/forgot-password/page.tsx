'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPasswordApi } from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/toast';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await forgotPasswordApi(email.trim());
      setSuccessMessage(
        res?.message ||
          'If an active account exists for this email, password reset instructions have been sent.',
      );
      showToast('Request Sent', 'Check your email for reset instructions.');
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Failed to process password reset request.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="border border-stone-200 bg-white p-8">
        <div className="text-center">
          <span className="inline-flex size-12 items-center justify-center bg-[#C9A227] text-stone-950 font-bold text-xl">
            EF
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-950 font-display uppercase">
            Forgot Password
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Enter your account email to receive a password reset link.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
            {successMessage}
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-stone-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending Request...' : 'Send Password Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-stone-500">
          Remember your password?{' '}
          <Link href="/login" className="font-bold text-[#C9A227] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
