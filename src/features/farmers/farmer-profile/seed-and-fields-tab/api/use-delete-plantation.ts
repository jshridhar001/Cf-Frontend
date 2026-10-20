import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { plantationKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { PlantationMessageResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeletePlantation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['plantations', 'delete'],
    mutationFn: async ({ id }: { id: string; fieldId: string }) => {
      const { data } = await apiClient.delete<PlantationMessageResponse>(`/v1/plantations/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { fieldId }) => {
      await queryClient.invalidateQueries({ queryKey: plantationKeys.list(fieldId) });
      toast.success(data.message || 'Plantation deleted successfully.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete plantation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
