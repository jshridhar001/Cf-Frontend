import { queryOptions, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import apiClient from '@/lib/api-client';
import type { MeResponse } from '../types';
import { authKeys } from './query-keys';

async function fetchMe(): Promise<MeResponse | null> {
  try {
    const { data } = await apiClient.get<MeResponse>('/me');
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

export function meQueryOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: fetchMe,
    staleTime: 1000 * 60,
    retry: false,
  });
}

export function useMe() {
  return useQuery(meQueryOptions());
}
