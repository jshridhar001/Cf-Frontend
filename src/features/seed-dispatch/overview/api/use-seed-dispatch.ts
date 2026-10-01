import { queryOptions, useQuery } from '@tanstack/react-query';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';
import apiClient from '@/lib/api-client';

type SeedDispatchResponse = {
  success: boolean;
  data: SeedDispatch;
};

async function fetchSeedDispatch(id: string): Promise<SeedDispatch> {
  const { data } = await apiClient.get<SeedDispatchResponse>(`/v1/seed-dispatches/${id}`);
  return data.data;
}

export function seedDispatchQueryOptions(id: string) {
  return queryOptions({
    queryKey: seedDispatchKeys.detail(id),
    queryFn: () => fetchSeedDispatch(id),
    staleTime: 1000 * 30,
    retry: false,
    enabled: Boolean(id),
  });
}

export function useSeedDispatch(id: string) {
  return useQuery(seedDispatchQueryOptions(id));
}
