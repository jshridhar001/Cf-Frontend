import { queryOptions, useQuery } from '@tanstack/react-query';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import {
  type FarmerFamiliesResponse,
  type FarmerFamily,
  normalizeFarmerFamily,
} from '@/features/farmers/overview/types';
import apiClient from '@/lib/api-client';

async function fetchFarmerFamilies(): Promise<FarmerFamily[]> {
  const { data } = await apiClient.get<FarmerFamiliesResponse>('/v1/farmers/families');
  const rows = Array.isArray(data.data) ? data.data : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return [];
    const family = normalizeFarmerFamily(row as Record<string, unknown>);
    return family.id ? [family] : [];
  });
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
