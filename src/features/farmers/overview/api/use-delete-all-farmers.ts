import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import type { FarmerMessageResponse } from '@/features/farmers/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteAllFarmers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['farmers', 'delete-all'],
    mutationFn: async () => {
      const { data } = await apiClient.delete<FarmerMessageResponse>('/v1/farmers/all');
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: farmersKeys.list() });
      toast.success(data.message || 'All farmers deleted permanently.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete farmers. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
