'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resendVerificationApi, verifyEmailApi } from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/toast';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();

  const [verifying, setVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend state
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    setVerifying(true);
    verifyEmailApi(token)
      .then((res) => {
        setVerified(true);
        showToast('Email Verified', res?.message || 'Your account is active!');
      })
      .catch((err) => {
        setErrorMessage(
          extractErrorMessage(err, 'Failed to verify email token.'),
        );
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token, showToast]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendLoading(true);
    setResendSuccess(null);
    setErrorMessage(null);

    try {
      const res = await resendVerificationApi(resendEmail.trim());
      setResendSuccess(
        res?.message || 'Verification link has been sent to your email.',
      );
      showToast('Verification Sent', 'Please check your email inbox.');
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Failed to resend verification email.'),
      );
    } finally {
      setResendLoading(false);
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
            Email Verification
          </h1>
        </div>

        {verifying && (
          <div className="mt-8 text-center text-sm font-semibold text-stone-600">
            Verifying your email token...
          </div>
        )}

        {!verifying && verified && (
          <div className="mt-6 text-center">
            <div className="border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
              Email successfully verified! Your account is now active.
            </div>
            <Link
              href="/login"
              className="mt-6 inline-block w-full bg-stone-950 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {!verifying && !verified && (
          <div className="mt-6">
            {errorMessage && (
              <div className="mb-6 border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-6 border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700">
                {resendSuccess}
              </div>
            )}

            <p className="text-xs text-stone-600">
              Need a new verification link? Enter your registered email address below to receive another verification email.
            </p>

            <form onSubmit={handleResend} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={resendLoading}
                className="w-full bg-stone-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resendLoading ? 'Sending Link...' : 'Resend Verification Email'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-stone-500">
              Back to{' '}
              <Link href="/login" className="font-bold text-[#C9A227] hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Loading Email Verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
