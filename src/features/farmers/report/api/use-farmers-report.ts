import { queryOptions, useQuery } from '@tanstack/react-query';
import { farmersReportKeys } from '@/features/farmers/report/api/query-keys';
import type { FarmerReportParams, FarmersReportResponse } from '@/features/farmers/report/types';
import apiClient from '@/lib/api-client';

async function fetchFarmersReport(params: FarmerReportParams): Promise<FarmersReportResponse> {
  const { data } = await apiClient.get<FarmersReportResponse>('/v1/farmers/report', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return data;
}

export function farmersReportQueryOptions(params: FarmerReportParams) {
  return queryOptions({
    queryKey: farmersReportKeys.list(params),
    queryFn: () => fetchFarmersReport(params),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFarmersReport(params: FarmerReportParams) {
  return useQuery(farmersReportQueryOptions(params));
}
