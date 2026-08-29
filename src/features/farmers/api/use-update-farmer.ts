import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import type { FarmerResponse, FarmerStatus } from '@/features/farmers/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const updateFarmerMutationKey = [...farmersKeys.all, 'update'] as const;

export type UpdateFarmerVariables = {
  farmerId: string;
  name: string;
  mobileNumber: string;
  status: FarmerStatus;
  bankName: string;
  ifscCode: string;
  bankAccountNumber: string;
};

export function useUpdateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateFarmerMutationKey,
    mutationFn: async ({ farmerId, ...body }: UpdateFarmerVariables) => {
      const { data } = await apiClient.put<FarmerResponse>(`/v1/farmers/${farmerId}`, body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (farmer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.detail(farmer.id) }),
      ]);
      toast.success('Farmer updated successfully', {
        description: `${farmer.name} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update farmer. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
