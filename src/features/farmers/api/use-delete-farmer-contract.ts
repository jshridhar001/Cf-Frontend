import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import type { FarmerMessageResponse } from '@/features/farmers/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const deleteFarmerContractMutationKey = [...farmersKeys.all, 'delete-contract'] as const;

export type DeleteFarmerContractVariables = {
  farmerId: string;
  contractId: string;
};

export function useDeleteFarmerContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteFarmerContractMutationKey,
    mutationFn: async ({ farmerId, contractId }: DeleteFarmerContractVariables) => {
      const { data } = await apiClient.delete<FarmerMessageResponse>(
        `/v1/farmers/${farmerId}/contracts/${contractId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { farmerId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.detail(farmerId) }),
      ]);
      toast.success(data.message || 'Contract deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete contract. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
