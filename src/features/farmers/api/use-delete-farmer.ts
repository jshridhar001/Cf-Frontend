import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import type { FarmerMessageResponse } from '@/features/farmers/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const deleteFarmerMutationKey = [...farmersKeys.all, 'delete'] as const;

export function useDeleteFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteFarmerMutationKey,
    mutationFn: async (farmerId: string) => {
      const { data } = await apiClient.delete<FarmerMessageResponse>(`/v1/farmers/${farmerId}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, farmerId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.detail(farmerId) }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.families() }),
      ]);
      toast.success(data.message || 'Farmer deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete farmer. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
