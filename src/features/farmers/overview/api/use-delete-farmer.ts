import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import type { FarmerMessageResponse } from '@/features/farmers/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['farmers', 'delete'],
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<FarmerMessageResponse>(`/v1/farmers/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: farmersKeys.list() });
      toast.success(data.message || 'Farmer deleted successfully.', {
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
