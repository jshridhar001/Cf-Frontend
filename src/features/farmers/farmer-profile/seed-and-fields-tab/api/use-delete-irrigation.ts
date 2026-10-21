import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { irrigationKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { IrrigationMessageResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/irrigation-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteIrrigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['irrigations', 'delete'],
    mutationFn: async ({ id }: { id: string; fieldId: string }) => {
      const { data } = await apiClient.delete<IrrigationMessageResponse>(`/v1/irrigations/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { fieldId }) => {
      await queryClient.invalidateQueries({ queryKey: irrigationKeys.list(fieldId) });
      toast.success(data.message || 'Irrigation deleted successfully.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete irrigation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
