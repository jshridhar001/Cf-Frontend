import { useQuery } from '@tanstack/react-query';
import { dehaulmingKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { DehaulmingsResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/dehaulming-types';
import apiClient from '@/lib/api-client';

export function useFieldDehaulmings(fieldId: string) {
  return useQuery({
    queryKey: dehaulmingKeys.list(fieldId),
    queryFn: async () => {
      const { data } = await apiClient.get<DehaulmingsResponse>('/v1/dehaulmings', {
        params: { fieldId },
      });
      return data.data;
    },
    enabled: Boolean(fieldId),
    retry: false,
  });
}
