import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import type { ApiFarmerResponse, CreateFarmerBody } from '@/features/farmers/overview/types';
import { toFarmer } from '@/features/farmers/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateFarmerVariables = {
  id: string;
  body: CreateFarmerBody;
};

export function useUpdateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['farmers', 'update'],
    mutationFn: async ({ id, body }: UpdateFarmerVariables) => {
      const { data } = await apiClient.put<ApiFarmerResponse>(`/v1/farmers/${id}`, body);
      return toFarmer(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (farmer) => {
      await queryClient.invalidateQueries({ queryKey: farmersKeys.list() });
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
