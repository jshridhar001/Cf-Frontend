import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { stripTestGroupKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { StripTestGroupMessageResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteStripTestGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['strip-test-groups', 'delete'],
    mutationFn: async ({ id }: { id: string; fieldId: string }) => {
      const { data } = await apiClient.delete<StripTestGroupMessageResponse>(
        `/v1/strip-test-groups/${id}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { fieldId }) => {
      await queryClient.invalidateQueries({ queryKey: stripTestGroupKeys.list(fieldId) });
      toast.success(data.message || 'Strip test group deleted successfully.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete strip test. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
