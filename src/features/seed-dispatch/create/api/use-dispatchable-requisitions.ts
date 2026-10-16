import { queryOptions, useQuery } from '@tanstack/react-query';

import { mapApprovedDeliveryLots } from '@/features/seed-dispatch/create/lib/map-dispatchable-requisition';
import type { DispatchableRequisition } from '@/features/seed-dispatch/create/types';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import type { SeedDispatchesResponse } from '@/features/seed-dispatch/overview/types';
import type { SeedRequisitionsResponse } from '@/features/seed-requisition/overview/types';
import apiClient from '@/lib/api-client';

async function fetchDispatchableRequisitions(): Promise<DispatchableRequisition[]> {
  const [requisitions, dispatches] = await Promise.all([
    apiClient.get<SeedRequisitionsResponse>('/v1/seed-requisitions'),
    apiClient.get<SeedDispatchesResponse>('/v1/seed-dispatches'),
  ]);
  return mapApprovedDeliveryLots(requisitions.data.data, dispatches.data.data);
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
