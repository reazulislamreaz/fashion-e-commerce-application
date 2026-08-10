'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordApi } from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/toast';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage('Missing password reset token.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordApi(token, password);
      setSuccessMessage(res?.message || 'Password has been reset successfully!');
      showToast('Password Updated', 'Your password has been reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Failed to reset password. Token may be invalid or expired.'),
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
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Choose a strong new password for your account.
          </p>
        </div>

        {!token && (
          <div className="mt-6 border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            Invalid or missing password reset token. Please request a new reset link.
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
            {successMessage}
            <div className="mt-4">
              <Link
                href="/login"
                className="inline-block w-full bg-stone-950 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        )}

        {token && !successMessage && (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-stone-300 p-3 pr-10 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-xs font-semibold text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-stone-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-stone-500">
          Back to{' '}
          <Link href="/login" className="font-bold text-[#C9A227] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Loading Reset Password...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
