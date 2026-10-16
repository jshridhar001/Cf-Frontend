import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { FacilityStockResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateFacilityStockVariables = {
  facilityId: string;
  varietyId: string;
  sizeId: string;
  generationId: string;
  initialQuantity: number;
};

export function useCreateFacilityStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'create-facility-stock'],
    mutationFn: async (variables: CreateFacilityStockVariables) => {
      const { data } = await apiClient.post<FacilityStockResponse>(
        '/v1/masters/facility-stock',
        variables,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (stock) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilityStock() });
      toast.success('Stock added successfully', {
        description: `${stock.initialQuantity} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add stock. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
