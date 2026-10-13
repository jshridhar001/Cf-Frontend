import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { FacilityStock, FacilityStocksResponse } from '../types';
import { masterKeys } from './query-keys';

async function fetchFacilityStock(facilityId: string): Promise<FacilityStock[]> {
  const { data } = await apiClient.get<FacilityStocksResponse>('/v1/masters/facility-stock', {
    params: { facilityId },
  });
  return data.data;
}

export function facilityStockQueryOptions(facilityId: string) {
  return queryOptions({
    queryKey: masterKeys.facilityStock(facilityId),
    queryFn: () => fetchFacilityStock(facilityId),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFacilityStock(facilityId: string) {
  return useQuery(facilityStockQueryOptions(facilityId));
}
