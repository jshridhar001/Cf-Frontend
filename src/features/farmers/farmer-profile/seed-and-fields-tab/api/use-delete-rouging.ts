import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rougingKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { RougingMessageResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/rouging-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteRouging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['rougings', 'delete'],
    mutationFn: async ({ id }: { id: string; fieldId: string }) => {
      const { data } = await apiClient.delete<RougingMessageResponse>(`/v1/rougings/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { fieldId }) => {
      await queryClient.invalidateQueries({ queryKey: rougingKeys.list(fieldId) });
      toast.success(data.message || 'Rouging deleted successfully.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete rouging. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
