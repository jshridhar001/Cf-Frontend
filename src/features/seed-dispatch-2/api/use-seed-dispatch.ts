import { queryOptions, useQuery } from '@tanstack/react-query';

import { seedDispatchKeys } from '@/features/seed-dispatch/api/query-keys';
import { mapSeedDispatchToDetail } from '@/features/seed-dispatch/lib/map-seed-dispatch-detail';
import type { SeedDispatchDetail, SeedDispatchResponse } from '@/features/seed-dispatch/types';
import apiClient from '@/lib/api-client';

async function fetchSeedDispatch(id: string): Promise<SeedDispatchDetail> {
  const { data } = await apiClient.get<SeedDispatchResponse>(`/v1/seed-dispatches/${id}`);
  return mapSeedDispatchToDetail(data.data);
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
