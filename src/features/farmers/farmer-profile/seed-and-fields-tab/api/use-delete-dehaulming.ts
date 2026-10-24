import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dehaulmingKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { DehaulmingMessageResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/dehaulming-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteDehaulming() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['dehaulmings', 'delete'],
    mutationFn: async ({ id }: { id: string; fieldId: string }) => {
      const { data } = await apiClient.delete<DehaulmingMessageResponse>(`/v1/dehaulmings/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { fieldId }) => {
      await queryClient.invalidateQueries({ queryKey: dehaulmingKeys.list(fieldId) });
      toast.success(data.message || 'Dehaulming deleted successfully.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete dehaulming. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
