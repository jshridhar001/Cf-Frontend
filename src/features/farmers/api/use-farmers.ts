import { queryOptions, useQuery } from '@tanstack/react-query';
import type { Farmer, FarmersResponse } from '@/features/farmers/types';
import apiClient from '@/lib/api-client';
import { farmersKeys } from './query-keys';

async function fetchFarmers(): Promise<Farmer[]> {
  const { data } = await apiClient.get<FarmersResponse>('/v1/farmers');
  return data.data;
}

export function farmersQueryOptions() {
  return queryOptions({
    queryKey: farmersKeys.list(),
    queryFn: fetchFarmers,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFarmers() {
  return useQuery(farmersQueryOptions());
}
