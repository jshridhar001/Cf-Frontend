import { useQuery } from '@tanstack/react-query';
import { fieldVisitKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { FieldVisitsResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-visit-types';
import apiClient from '@/lib/api-client';

export function useFieldVisits(fieldId: string) {
  return useQuery({
    queryKey: fieldVisitKeys.list(fieldId),
    queryFn: async () => {
      const { data } = await apiClient.get<FieldVisitsResponse>('/v1/field-visits', {
        params: { fieldId },
      });
      return data.data;
    },
    enabled: Boolean(fieldId),
    retry: false,
  });
}
