import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { FacilityStockMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteFacilityStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-facility-stock'],
    mutationFn: async (stockId: string) => {
      const { data } = await apiClient.delete<FacilityStockMessageResponse>(
        `/v1/masters/facility-stock/${stockId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: masterKeys.facilityStock() }),
        queryClient.invalidateQueries({ queryKey: masterKeys.facilityStockSummary() }),
      ]);
      toast.success(data.message || 'Facility stock deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete stock. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
