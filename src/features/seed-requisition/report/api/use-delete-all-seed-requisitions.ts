import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { invalidateSeedRequisitionCaches } from '@/features/seed-requisition/report/api/invalidate';
import type { SeedRequisitionMessageResponse } from '@/features/seed-requisition/report/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteAllSeedRequisitions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'delete-all'],
    mutationFn: async () => {
      const { data } =
        await apiClient.delete<SeedRequisitionMessageResponse>('/v1/seed-requisitions');
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await invalidateSeedRequisitionCaches(queryClient);
      toast.success(data.message || 'All requisitions deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to delete seed requisitions. Please try again.'),
        {
          position: 'bottom-right',
        },
      );
    },
  });
}
