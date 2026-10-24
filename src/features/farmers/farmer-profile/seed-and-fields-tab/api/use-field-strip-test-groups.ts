import { useQuery } from '@tanstack/react-query';
import { stripTestGroupKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { StripTestGroupsResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';
import apiClient from '@/lib/api-client';

export function useFieldStripTestGroups(fieldId: string) {
  return useQuery({
    queryKey: stripTestGroupKeys.list(fieldId),
    queryFn: async () => {
      const { data } = await apiClient.get<StripTestGroupsResponse>('/v1/strip-test-groups', {
        params: { fieldId },
      });
      return data.data;
    },
    enabled: Boolean(fieldId),
    retry: false,
  });
}
