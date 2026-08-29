import { queryOptions, useQuery } from '@tanstack/react-query';
import type { FarmerFamiliesResponse, FarmerFamily } from '@/features/farmers/types';
import { normalizeFarmerFamily } from '@/features/farmers/types';
import apiClient from '@/lib/api-client';
import { farmersKeys } from './query-keys';

async function fetchFarmerFamilies(): Promise<FarmerFamily[]> {
  const { data } = await apiClient.get<FarmerFamiliesResponse>('/v1/farmers/families');
  const rows = Array.isArray(data.data) ? data.data : [];
  return rows.map((row) => normalizeFarmerFamily(row as unknown as Record<string, unknown>));
}

export function farmerFamiliesQueryOptions() {
  return queryOptions({
    queryKey: farmersKeys.families(),
    queryFn: fetchFarmerFamilies,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFarmerFamilies() {
  return useQuery(farmerFamiliesQueryOptions());
}
