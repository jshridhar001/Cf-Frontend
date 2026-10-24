import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stripTestGroupKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  CreateStripTestGroupInput,
  StripTestGroupResponse,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateStripTestGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['strip-test-groups', 'create'],
    mutationFn: async (body: CreateStripTestGroupInput) => {
      const { data } = await apiClient.post<StripTestGroupResponse>('/v1/strip-test-groups', body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({
        queryKey: stripTestGroupKeys.list(group.fieldId),
      });
      toast.success('Strip test added', {
        description: `${group.name} has been recorded.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add strip test. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
