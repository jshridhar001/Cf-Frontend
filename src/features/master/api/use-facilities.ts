import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { FacilitiesResponse, Facility } from '../types';
import { masterKeys } from './query-keys';

async function fetchFacilities(): Promise<Facility[]> {
  const { data } = await apiClient.get<FacilitiesResponse>('/v1/masters/facilities');
  return data.data;
}

export function facilitiesQueryOptions() {
  return queryOptions({
    queryKey: masterKeys.facilities(),
    queryFn: fetchFacilities,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFacilities() {
  return useQuery(facilitiesQueryOptions());
}
