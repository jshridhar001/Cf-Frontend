import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { SeedSize, SeedSizesResponse } from '../types';
import { masterKeys } from './query-keys';

async function fetchSeedSizes(): Promise<SeedSize[]> {
  const { data } = await apiClient.get<SeedSizesResponse>('/v1/masters/seed-sizes');
  return data.data;
}

export function seedSizesQueryOptions() {
  return queryOptions({
    queryKey: masterKeys.seedSizes(),
    queryFn: fetchSeedSizes,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedSizes() {
  return useQuery(seedSizesQueryOptions());
}
