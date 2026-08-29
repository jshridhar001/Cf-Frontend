import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { VarietyMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteAllVarieties() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-all-varieties'],
    mutationFn: async () => {
      const { data } = await apiClient.delete<VarietyMessageResponse>('/v1/masters/varieties/all');
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.varieties() });
      toast.success(data.message || 'All varieties deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete varieties. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
