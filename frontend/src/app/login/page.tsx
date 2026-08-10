'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { ApiClientError } from '@/lib/api/types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      showToast('Welcome back!', 'Successfully signed in to your account.');
      router.push(redirect);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Invalid credentials. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#C9A227] text-stone-950 font-bold text-xl shadow-md">
            EF
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-stone-950 font-display">
            Sign In to Easy Fashion
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Enter your email and password to access your account and orders.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

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
              className="rounded-xl border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-stone-950 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Don&apos;t have an account?{' '}
          <Link
            href={`/register${redirect ? `?redirect=${redirect}` : ''}`}
            className="font-bold text-[#C9A227] hover:underline"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
