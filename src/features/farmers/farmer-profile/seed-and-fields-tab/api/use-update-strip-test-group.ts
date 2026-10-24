import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stripTestGroupKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  StripTestGroupResponse,
  UpdateStripTestGroupInput,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useUpdateStripTestGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['strip-test-groups', 'update'],
    mutationFn: async ({ id, ...body }: UpdateStripTestGroupInput) => {
      const { data } = await apiClient.put<StripTestGroupResponse>(
        `/v1/strip-test-groups/${id}`,
        body,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({
        queryKey: stripTestGroupKeys.list(group.fieldId),
      });
      toast.success('Strip test updated', {
        description: `${group.name} has been saved.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update strip test. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
