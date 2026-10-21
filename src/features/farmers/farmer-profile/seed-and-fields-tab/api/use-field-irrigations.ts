import { useQuery } from '@tanstack/react-query';
import { irrigationKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { IrrigationsResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/irrigation-types';
import apiClient from '@/lib/api-client';

export function useFieldIrrigations(fieldId: string) {
  return useQuery({
    queryKey: irrigationKeys.list(fieldId),
    queryFn: async () => {
      const { data } = await apiClient.get<IrrigationsResponse>('/v1/irrigations', {
        params: { fieldId },
      });
      return data.data;
    },
    enabled: Boolean(fieldId),
    retry: false,
  });
}
