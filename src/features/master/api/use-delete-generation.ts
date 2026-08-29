import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { GenerationMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-generation'],
    mutationFn: async (generationId: string) => {
      const { data } = await apiClient.delete<GenerationMessageResponse>(
        `/v1/masters/generations/${generationId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.generations() });
      toast.success(data.message || 'Generation deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete generation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
