import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Generation, GenerationsResponse } from '../types';
import { masterKeys } from './query-keys';

async function fetchGenerations(): Promise<Generation[]> {
  const { data } = await apiClient.get<GenerationsResponse>('/v1/masters/generations');
  return data.data;
}

export function generationsQueryOptions() {
  return queryOptions({
    queryKey: masterKeys.generations(),
    queryFn: fetchGenerations,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useGenerations() {
  return useQuery(generationsQueryOptions());
}
