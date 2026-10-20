import { queryOptions, useQuery } from '@tanstack/react-query';
import { farmerFieldKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  FarmerField,
  FieldsListResponse,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';
import apiClient from '@/lib/api-client';

async function fetchFields(): Promise<FarmerField[]> {
  const { data } = await apiClient.get<FieldsListResponse>('/v1/fields');
  return data.data;
}

export function fieldsQueryOptions() {
  return queryOptions({
    queryKey: farmerFieldKeys.list(),
    queryFn: fetchFields,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useFarmerFields(farmerId: string) {
  return useQuery({
    ...fieldsQueryOptions(),
    select: (fields) => fields.filter((field) => field.farmerId === farmerId),
  });
}
