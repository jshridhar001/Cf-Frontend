import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import type { FarmerContractResponse } from '@/features/farmers/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const createFarmerContractMutationKey = [...farmersKeys.all, 'create-contract'] as const;

export type CreateFarmerContractVariables = {
  farmerId: string;
  variety: string;
  date: string;
  acres: string;
  contractUrl: string;
};

export function useCreateFarmerContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createFarmerContractMutationKey,
    mutationFn: async ({ farmerId, ...body }: CreateFarmerContractVariables) => {
      const { data } = await apiClient.post<FarmerContractResponse>(
        `/v1/farmers/${farmerId}/contracts`,
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
      toast.success(data.message || 'Contract created successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create contract. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
