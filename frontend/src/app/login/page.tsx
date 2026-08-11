'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { extractErrorMessage } from '@/lib/api/errors';
import { getRoleDefaultRedirect } from '@/lib/utils/auth-redirect';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');

  const { login, user, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Surface OAuth provider failures redirected back as ?error=...
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setErrorMessage(oauthError);
      showToast('Social login failed', oauthError, 'error');
    }
  }, [searchParams, showToast]);

  // If already authenticated, redirect to role-appropriate destination
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const target = getRoleDefaultRedirect(user, rawRedirect);
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, user, router, rawRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const authenticatedUser = await login(email.trim(), password);
      showToast('Welcome back!', 'Successfully signed in to your account.');

      const target = getRoleDefaultRedirect(authenticatedUser, rawRedirect);
      router.push(target);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Invalid email or password. Please try again.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const isVerifyRequired = searchParams.get('verify') === 'required';

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="border border-stone-200 bg-white p-8">
        <div className="text-center">
          <span className="inline-flex size-12 items-center justify-center bg-[#C9A227] text-stone-950 font-bold text-xl">
            EF
          </span>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
            Customer Sign In
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Sign in to access your orders, saved addresses, and profile details.
          </p>
        </div>

        {isVerifyRequired && (
          <div className="mt-6 border border-[#C9A227] bg-amber-50 p-4 text-xs font-semibold text-amber-900 leading-relaxed">
            <span className="font-bold block uppercase tracking-wider text-[#C9A227] mb-0.5">
              Account Registered Successfully!
            </span>
            Please check your email inbox to verify your account before signing in.
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
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
              className="border border-stone-300 p-3 text-sm text-stone-900 focus:border-[#C9A227] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#C9A227] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 border-stone-300 text-stone-950 focus:ring-[#C9A227]"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-stone-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <SocialAuthButtons actionLabel="Sign In" />

        <div className="mt-6 text-center text-xs text-stone-500">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/register${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ''}`}
            className="font-bold text-[#C9A227] hover:underline"
          >
            Register Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Loading Sign In...</div>}>
      <LoginContent />
    </Suspense>
  );
}
