import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { FacilityStockSummaryResponse, FacilityStockSummaryVariety } from '../types';
import { masterKeys } from './query-keys';

async function fetchFacilityStockSummary(): Promise<FacilityStockSummaryVariety[]> {
  const { data } = await apiClient.get<FacilityStockSummaryResponse>(
    '/v1/masters/facility-stock/summary',
  );
  return data.data;
}

export function facilityStockSummaryQueryOptions() {
  return queryOptions({
    queryKey: masterKeys.facilityStockSummary(),
    queryFn: fetchFacilityStockSummary,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFacilityStockSummary() {
  return useQuery(facilityStockSummaryQueryOptions());
}
