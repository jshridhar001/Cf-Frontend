import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { SeedSizeMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteSeedSizes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-seed-sizes'],
    mutationFn: async (seedSizeIds: string[]) => {
      await Promise.all(
        seedSizeIds.map((seedSizeId) =>
          apiClient.delete<SeedSizeMessageResponse>(`/v1/masters/seed-sizes/${seedSizeId}`),
        ),
      );
      return seedSizeIds.length;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.seedSizes() });
    },
    onSuccess: (count) => {
      toast.success(
        count === 1 ? 'Seed size deleted successfully' : `${count} seed sizes deleted successfully`,
        { position: 'bottom-right' },
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete seed sizes. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
