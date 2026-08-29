import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { TuberSizeMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteTuberSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-tuber-size'],
    mutationFn: async (tuberSizeId: string) => {
      const { data } = await apiClient.delete<TuberSizeMessageResponse>(
        `/v1/masters/tuber-sizes/${tuberSizeId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.tuberSizes() });
      toast.success(data.message || 'Tuber size deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete tuber size. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
