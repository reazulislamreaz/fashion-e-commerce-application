'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { apiClient } from '@/lib/api/client';
import { ApiClientError } from '@/lib/api/types';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';

type HealthData = {
  status: string;
  uptime: number;
  timestamp: string;
  database: string;
};

type ViewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: HealthData };

export function HealthStatus() {
  const [state, setState] = useState<ViewState>({ status: 'loading' });
  const [isPending, startTransition] = useTransition();

  const loadHealth = useCallback(() => {
    startTransition(async () => {
      setState({ status: 'loading' });
      try {
        const data = await apiClient.get<HealthData>('/health');
        if (!data) {
          setState({ status: 'empty' });
          return;
        }
        setState({ status: 'success', data });
      } catch (error) {
        const message =
          error instanceof ApiClientError
            ? error.message
            : 'Unable to reach the API health endpoint.';
        setState({ status: 'error', message });
      }
    });
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  if (state.status === 'loading' || isPending) {
    return <LoadingState label="Checking API health..." />;
  }

  if (state.status === 'error') {
    return (
      <ErrorState
        title="Unable to load health status"
        message={state.message}
        onRetry={loadHealth}
      />
    );
  }

  if (state.status === 'empty') {
    return (
      <EmptyState message="The health endpoint returned no data." />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="border border-stone-900/10 bg-white/70 p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">Status</p>
        <p className="mt-2 text-xl font-semibold capitalize">
          {state.data.status}
        </p>
      </div>
      <div className="border border-stone-900/10 bg-white/70 p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          Database
        </p>
        <p className="mt-2 text-xl font-semibold capitalize">
          {state.data.database}
        </p>
      </div>
      <div className="border border-stone-900/10 bg-white/70 p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">Uptime</p>
        <p className="mt-2 text-xl font-semibold">
          {Math.round(state.data.uptime)}s
        </p>
      </div>
    </div>
  );
}
