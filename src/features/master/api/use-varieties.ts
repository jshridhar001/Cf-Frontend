import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { VarietiesResponse, Variety } from '../types';
import { masterKeys } from './query-keys';

async function fetchVarieties(): Promise<Variety[]> {
  const { data } = await apiClient.get<VarietiesResponse>('/v1/masters/varieties');
  return data.data;
}

export function varietiesQueryOptions() {
  return queryOptions({
    queryKey: masterKeys.varieties(),
    queryFn: fetchVarieties,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useVarieties() {
  return useQuery(varietiesQueryOptions());
}
