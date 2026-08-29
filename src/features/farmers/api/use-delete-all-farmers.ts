import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import type { FarmerMessageResponse } from '@/features/farmers/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const deleteAllFarmersMutationKey = [...farmersKeys.all, 'delete-all'] as const;

export function useDeleteAllFarmers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteAllFarmersMutationKey,
    mutationFn: async () => {
      const { data } = await apiClient.delete<FarmerMessageResponse>('/v1/farmers/all');
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.families() }),
      ]);
      toast.success(data.message || 'All farmers deleted successfully', {
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
