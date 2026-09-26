import { queryOptions, useQuery } from '@tanstack/react-query';
import type {
  FarmerAddressOptions,
  FarmerAddressOptionsResponse,
} from '@/features/farmers/overview/types';
import apiClient from '@/lib/api-client';
import { farmersKeys } from './query-keys';

async function fetchFarmerAddressOptions(): Promise<FarmerAddressOptions> {
  const { data } = await apiClient.get<FarmerAddressOptionsResponse>('/v1/farmers/address-options');
  return data.data;
}

export function farmerAddressOptionsQueryOptions() {
  return queryOptions({
    queryKey: farmersKeys.addressOptions(),
    queryFn: fetchFarmerAddressOptions,
    staleTime: 1000 * 60,
    retry: false,
  });
}

export function useFarmerAddressOptions() {
  return useQuery(farmerAddressOptionsQueryOptions());
}
