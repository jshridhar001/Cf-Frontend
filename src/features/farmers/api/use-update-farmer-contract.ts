import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import type { FarmerContractResponse } from '@/features/farmers/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const updateFarmerContractMutationKey = [...farmersKeys.all, 'update-contract'] as const;

export type UpdateFarmerContractVariables = {
  farmerId: string;
  contractId: string;
  variety: string;
  date: string;
  acres: string;
  contractUrl: string;
};

export function useUpdateFarmerContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateFarmerContractMutationKey,
    mutationFn: async ({ farmerId, contractId, ...body }: UpdateFarmerContractVariables) => {
      const { data } = await apiClient.put<FarmerContractResponse>(
        `/v1/farmers/${farmerId}/contracts/${contractId}`,
        body,
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
      toast.success(data.message || 'Contract updated successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update contract. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
