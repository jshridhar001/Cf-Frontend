import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  type Farmer,
  type FarmerResponse,
  normalizeFarmerContracts,
} from '@/features/farmers/types';
import apiClient from '@/lib/api-client';
import { farmersKeys } from './query-keys';

async function fetchFarmer(id: string): Promise<Farmer> {
  const { data } = await apiClient.get<FarmerResponse>(`/v1/farmers/${id}`);
  const farmer = data.data;
  return {
    ...farmer,
    contracts: normalizeFarmerContracts(farmer.contracts),
  };
}

export function farmerQueryOptions(id: string) {
  return queryOptions({
    queryKey: farmersKeys.detail(id),
    queryFn: () => fetchFarmer(id),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFarmer(id: string) {
  return useQuery({
    ...farmerQueryOptions(id),
    enabled: id.length > 0,
  });
}
