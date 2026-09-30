import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import type { ApiFarmerResponse, CreateFarmerBody } from '@/features/farmers/overview/types';
import { toFarmer } from '@/features/farmers/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['farmers', 'create'],
    mutationFn: async (body: CreateFarmerBody) => {
      const { data } = await apiClient.post<ApiFarmerResponse>('/v1/farmers', body);
      return toFarmer(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (farmer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.families() }),
      ]);
      toast.success('Farmer created successfully', {
        description: `${farmer.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create farmer. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
