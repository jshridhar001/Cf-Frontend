import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  type FarmerContract,
  type FarmerContractsResponse,
  normalizeFarmerContracts,
} from '@/features/farmers/types';
import apiClient from '@/lib/api-client';
import { farmersKeys } from './query-keys';

async function fetchFarmerContracts(farmerId: string): Promise<FarmerContract[]> {
  const { data } = await apiClient.get<FarmerContractsResponse>(
    `/v1/farmers/${farmerId}/contracts`,
  );
  return normalizeFarmerContracts(data.data);
}

export function farmerContractsQueryOptions(farmerId: string) {
  return queryOptions({
    queryKey: farmersKeys.contracts(farmerId),
    queryFn: () => fetchFarmerContracts(farmerId),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFarmerContracts(farmerId: string) {
  return useQuery({
    ...farmerContractsQueryOptions(farmerId),
    enabled: farmerId.length > 0,
  });
}
