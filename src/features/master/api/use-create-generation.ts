import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { GenerationResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateGenerationVariables = {
  name: string;
};

export function useCreateGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'create-generation'],
    mutationFn: async ({ name }: CreateGenerationVariables) => {
      const { data } = await apiClient.post<GenerationResponse>('/v1/masters/generations', {
        name,
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (generation) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.generations() });
      toast.success('Generation created successfully', {
        description: `${generation.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create generation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
