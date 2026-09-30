import { queryOptions, useQuery } from '@tanstack/react-query';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import type { SeedDispatch, SeedDispatchesResponse } from '@/features/seed-dispatch/overview/types';
import apiClient from '@/lib/api-client';

async function fetchSeedDispatches(): Promise<SeedDispatch[]> {
  const { data } = await apiClient.get<SeedDispatchesResponse>('/v1/seed-dispatches');
  return data.data;
}

export function seedDispatchesQueryOptions() {
  return queryOptions({
    queryKey: seedDispatchKeys.list(),
    queryFn: fetchSeedDispatches,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedDispatches() {
  return useQuery(seedDispatchesQueryOptions());
}
