import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { TuberSize, TuberSizesResponse } from '../types';
import { masterKeys } from './query-keys';

async function fetchTuberSizes(): Promise<TuberSize[]> {
  const { data } = await apiClient.get<TuberSizesResponse>('/v1/masters/tuber-sizes');
  return data.data;
}

export function tuberSizesQueryOptions() {
  return queryOptions({
    queryKey: masterKeys.tuberSizes(),
    queryFn: fetchTuberSizes,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useTuberSizes() {
  return useQuery(tuberSizesQueryOptions());
}
