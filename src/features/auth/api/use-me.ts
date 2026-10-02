import { queryOptions, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import apiClient from '@/lib/api-client';
import { isConnectionTimeout } from '@/lib/http-error';
import { getAuthToken, useAuthTokenStore } from '../lib/auth-token-store';
import type { MeResponse } from '../types';
import { authKeys } from './query-keys';

const TIMEOUT_RETRY_MS = 1000;

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForAuthTokenHydration(): Promise<void> {
  if (useAuthTokenStore.persist.hasHydrated()) return Promise.resolve();

  return new Promise((resolve) => {
    const unsubscribe = useAuthTokenStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });

    if (useAuthTokenStore.persist.hasHydrated()) {
      unsubscribe();
      resolve();
    }
  });
}

async function fetchMe(): Promise<MeResponse | null> {
  await waitForAuthTokenHydration();

  if (!getAuthToken()) return null;

  for (;;) {
    try {
      const { data } = await apiClient.get<MeResponse>('/me');
      return data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      if (isConnectionTimeout(error)) {
        await delay(TIMEOUT_RETRY_MS);
        continue;
      }
      throw error;
    }
  }
}

export function meQueryOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: fetchMe,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useMe() {
  return useQuery(meQueryOptions());
}
