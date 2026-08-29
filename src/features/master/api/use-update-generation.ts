import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { GenerationResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateGenerationVariables = {
  generationId: string;
  name: string;
};

export function useUpdateGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'update-generation'],
    mutationFn: async ({ generationId, name }: UpdateGenerationVariables) => {
      const { data } = await apiClient.put<GenerationResponse>(
        `/v1/masters/generations/${generationId}`,
        { name },
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (generation) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.generations() });
      toast.success('Generation updated successfully', {
        description: `${generation.name} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update generation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
