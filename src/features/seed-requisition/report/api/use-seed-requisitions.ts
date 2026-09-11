import { queryOptions, useQuery } from '@tanstack/react-query';

import { seedRequisitionKeys } from '@/features/seed-requisition/report/api/query-keys';
import { mapSeedRequisitionToRow } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type {
  SeedRequisitionRow,
  SeedRequisitionsResponse,
} from '@/features/seed-requisition/report/types';
import apiClient from '@/lib/api-client';

async function fetchSeedRequisitions(): Promise<SeedRequisitionRow[]> {
  const { data } = await apiClient.get<SeedRequisitionsResponse>('/v1/seed-requisitions');
  return (data.data ?? []).map(mapSeedRequisitionToRow);
}

export function seedRequisitionsQueryOptions() {
  return queryOptions({
    queryKey: seedRequisitionKeys.list(),
    queryFn: fetchSeedRequisitions,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedRequisitions() {
  return useQuery(seedRequisitionsQueryOptions());
}
