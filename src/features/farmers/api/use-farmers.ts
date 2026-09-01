import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  type Farmer,
  type FarmersResponse,
  normalizeFarmerContracts,
} from '@/features/farmers/types';
import apiClient from '@/lib/api-client';
import { farmersKeys } from './query-keys';

async function fetchFarmers(): Promise<Farmer[]> {
  const { data } = await apiClient.get<FarmersResponse>('/v1/farmers');
  return data.data.map((farmer) => ({
    ...farmer,
    contracts: normalizeFarmerContracts(farmer.contracts),
  }));
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
