import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Station, StationsResponse } from '../types';
import { masterKeys } from './query-keys';

async function fetchStations(): Promise<Station[]> {
  const { data } = await apiClient.get<StationsResponse>('/v1/masters/stations');
  return data.data;
}

export function stationsQueryOptions() {
  return queryOptions({
    queryKey: masterKeys.stations(),
    queryFn: fetchStations,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useStations() {
  return useQuery(stationsQueryOptions());
}
