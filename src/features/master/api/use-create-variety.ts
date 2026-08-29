import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { VarietyResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateVarietyVariables = {
  name: string;
};

export function useCreateVariety() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'create-variety'],
    mutationFn: async ({ name }: CreateVarietyVariables) => {
      const { data } = await apiClient.post<VarietyResponse>('/v1/masters/varieties', { name });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (variety) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.varieties() });
      toast.success('Variety created successfully', {
        description: `${variety.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create variety. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
