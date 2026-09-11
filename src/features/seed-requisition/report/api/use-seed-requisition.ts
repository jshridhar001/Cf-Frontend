import { queryOptions, useQuery } from '@tanstack/react-query';

import { seedRequisitionKeys } from '@/features/seed-requisition/report/api/query-keys';
import { mapSeedRequisitionToDetail } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type {
  SeedRequisitionDetail,
  SeedRequisitionResponse,
} from '@/features/seed-requisition/report/types';
import apiClient from '@/lib/api-client';

async function fetchSeedRequisition(id: string): Promise<SeedRequisitionDetail> {
  const { data } = await apiClient.get<SeedRequisitionResponse>(`/v1/seed-requisitions/${id}`);
  return mapSeedRequisitionToDetail(data.data);
}

export function seedRequisitionQueryOptions(id: string) {
  return queryOptions({
    queryKey: seedRequisitionKeys.detail(id),
    queryFn: () => fetchSeedRequisition(id),
    staleTime: 1000 * 30,
    retry: false,
    enabled: Boolean(id),
  });
}

export function useSeedRequisition(id: string) {
  return useQuery(seedRequisitionQueryOptions(id));
}
