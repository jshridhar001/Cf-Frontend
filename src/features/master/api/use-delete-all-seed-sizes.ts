import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { SeedSizeMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteAllSeedSizes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-all-seed-sizes'],
    mutationFn: async () => {
      const { data } = await apiClient.delete<SeedSizeMessageResponse>(
        '/v1/masters/seed-sizes/all',
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.seedSizes() });
      toast.success(data.message || 'All seed sizes deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete seed sizes. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
