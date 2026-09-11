import { queryOptions, useQuery } from '@tanstack/react-query';
import { seedRequisitionReportKeys } from '@/features/seed-requisition/report/api/query-keys';
import { mapSeedRequisitionToRow } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type {
  SeedRequisitionRow,
  SeedRequisitionsResponse,
} from '@/features/seed-requisition/report/types';
import apiClient from '@/lib/api-client';

async function fetchSeedRequisitionReport(): Promise<SeedRequisitionRow[]> {
  const { data } = await apiClient.get<SeedRequisitionsResponse>('/v1/seed-requisitions/report');
  return (data.data ?? []).map(mapSeedRequisitionToRow);
}

export function seedRequisitionReportQueryOptions() {
  return queryOptions({
    queryKey: seedRequisitionReportKeys.list(),
    queryFn: fetchSeedRequisitionReport,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedRequisitionReport() {
  return useQuery(seedRequisitionReportQueryOptions());
}
