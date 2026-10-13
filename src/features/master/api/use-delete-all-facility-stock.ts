import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { FacilityStockMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteAllFacilityStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-all-facility-stock'],
    mutationFn: async () => {
      const { data } = await apiClient.delete<FacilityStockMessageResponse>(
        '/v1/masters/facility-stock/all',
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilityStock() });
      toast.success(data.message || 'All facility stock deleted permanently', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete facility stock. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
