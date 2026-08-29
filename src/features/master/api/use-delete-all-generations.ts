import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { GenerationMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteAllGenerations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-all-generations'],
    mutationFn: async () => {
      const { data } = await apiClient.delete<GenerationMessageResponse>(
        '/v1/masters/generations/all',
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.generations() });
      toast.success(data.message || 'All generations deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete generations. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
