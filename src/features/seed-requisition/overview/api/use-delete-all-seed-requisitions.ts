import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionMessageResponse } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteAllSeedRequisitions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'delete-all'],
    mutationFn: async () => {
      const { data } = await apiClient.delete<SeedRequisitionMessageResponse>(
        '/v1/seed-requisitions/all',
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() });
      toast.success(data.message || 'All seed requisitions deleted permanently.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete requisitions. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
