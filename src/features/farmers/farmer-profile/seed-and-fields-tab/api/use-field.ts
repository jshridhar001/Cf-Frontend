import { useQuery } from '@tanstack/react-query';
import { farmerFieldKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { FieldResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';
import apiClient from '@/lib/api-client';

export function useField(id: string | null) {
  return useQuery({
    queryKey: farmerFieldKeys.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await apiClient.get<FieldResponse>(`/v1/fields/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
    retry: false,
  });
}
