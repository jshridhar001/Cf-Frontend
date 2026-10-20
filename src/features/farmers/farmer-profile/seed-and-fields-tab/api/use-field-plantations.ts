import { useQuery } from '@tanstack/react-query';
import { plantationKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { PlantationsResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';
import apiClient from '@/lib/api-client';

export function useFieldPlantations(fieldId: string) {
  return useQuery({
    queryKey: plantationKeys.list(fieldId),
    queryFn: async () => {
      const { data } = await apiClient.get<PlantationsResponse>('/v1/plantations', {
        params: { fieldId },
      });
      return data.data;
    },
    enabled: Boolean(fieldId),
    retry: false,
  });
}
