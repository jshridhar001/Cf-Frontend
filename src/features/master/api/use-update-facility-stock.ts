import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { FacilityStockResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateFacilityStockVariables = {
  stockId: string;
  initialQuantity: number;
  currentQuantity: number;
};

export function useUpdateFacilityStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'update-facility-stock'],
    mutationFn: async ({
      stockId,
      initialQuantity,
      currentQuantity,
    }: UpdateFacilityStockVariables) => {
      const { data } = await apiClient.put<FacilityStockResponse>(
        `/v1/masters/facility-stock/${stockId}`,
        { initialQuantity, currentQuantity },
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (stock) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilityStock() });
      toast.success('Stock updated successfully', {
        description: `Current quantity is now ${stock.currentQuantity}.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update stock. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
