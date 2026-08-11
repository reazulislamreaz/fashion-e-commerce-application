'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { getMeApi } from '@/lib/api/services';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const { showToast } = useToast();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const errorMsg = searchParams.get('error');

    if (errorMsg) {
      showToast('Authentication Error', errorMsg, 'error');
      router.push('/login');
      return;
    }

    if (!accessToken || !refreshToken) {
      showToast('Authentication Failed', 'Missing authentication tokens from provider.', 'error');
      router.push('/login');
      return;
    }

    async function completeOAuth() {
      try {
        const user = await getMeApi(accessToken!);
        setSession({ user, accessToken: accessToken!, refreshToken: refreshToken! });
        showToast('Login Successful', `Welcome, ${user.fullName}!`, 'success');

        const isStaff = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role?.code);
        if (isStaff) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to finalize OAuth session.';
        showToast('Session Setup Failed', msg, 'error');
        router.push('/login');
      }
    }

    completeOAuth();
  }, [searchParams, setSession, showToast, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="size-8 animate-spin rounded-full border-3 border-stone-300 border-t-stone-900" />
      <p className="mt-4 text-xs font-semibold text-stone-600">Completing social login...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="size-8 animate-spin rounded-full border-3 border-stone-300 border-t-stone-900" />
          <p className="mt-4 text-xs font-semibold text-stone-600">Loading...</p>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
