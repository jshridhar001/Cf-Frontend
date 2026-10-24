import { useQuery } from '@tanstack/react-query';
import { rougingKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { RougingsResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/rouging-types';
import apiClient from '@/lib/api-client';

export function useFieldRougings(fieldId: string) {
  return useQuery({
    queryKey: rougingKeys.list(fieldId),
    queryFn: async () => {
      const { data } = await apiClient.get<RougingsResponse>('/v1/rougings', {
        params: { fieldId },
      });
      return data.data;
    },
    enabled: Boolean(fieldId),
    retry: false,
  });
}
