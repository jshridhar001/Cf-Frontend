import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { SeedSize, SeedSizesResponse } from '../types';
import { masterKeys } from './query-keys';

async function fetchSeedSizes(varietyId?: string): Promise<SeedSize[]> {
  const { data } = await apiClient.get<SeedSizesResponse>('/v1/masters/seed-sizes', {
    params: varietyId ? { varietyId } : undefined,
  });
  return data.data;
}

export function seedSizesQueryOptions(varietyId?: string) {
  return queryOptions({
    queryKey: masterKeys.seedSizes(varietyId),
    queryFn: () => fetchSeedSizes(varietyId),
    staleTime: 1000 * 30,
    retry: false,
  });
}

type UseSeedSizesOptions = {
  enabled?: boolean;
};

export function useSeedSizes(varietyId?: string, options?: UseSeedSizesOptions) {
  return useQuery({
    ...seedSizesQueryOptions(varietyId),
    enabled: options?.enabled ?? true,
  });
}
