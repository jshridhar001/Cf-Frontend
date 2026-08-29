import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { VarietyMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteVariety() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-variety'],
    mutationFn: async (varietyId: string) => {
      const { data } = await apiClient.delete<VarietyMessageResponse>(
        `/v1/masters/varieties/${varietyId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.varieties() });
      toast.success(data.message || 'Variety deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete variety. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
