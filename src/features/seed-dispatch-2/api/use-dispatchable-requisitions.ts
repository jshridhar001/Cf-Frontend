import { queryOptions, useQuery } from '@tanstack/react-query';

import { seedDispatchKeys } from '@/features/seed-dispatch/api/query-keys';
import { mapSeedRequisitionToDispatchable } from '@/features/seed-dispatch/lib/map-dispatchable-requisition';
import type { DispatchableRequisition } from '@/features/seed-dispatch/types';
import type { SeedRequisitionsResponse } from '@/features/seed-requisition/types';
import apiClient from '@/lib/api-client';

async function fetchDispatchableRequisitions(): Promise<DispatchableRequisition[]> {
  const { data } = await apiClient.get<SeedRequisitionsResponse>('/v1/seed-requisitions');
  return data.data
    .map(mapSeedRequisitionToDispatchable)
    .filter((row): row is DispatchableRequisition => row != null);
}

export function dispatchableRequisitionsQueryOptions() {
  return queryOptions({
    queryKey: seedDispatchKeys.dispatchable(),
    queryFn: fetchDispatchableRequisitions,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useDispatchableRequisitions() {
  return useQuery(dispatchableRequisitionsQueryOptions());
}
