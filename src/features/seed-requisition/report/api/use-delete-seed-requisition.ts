import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { invalidateSeedRequisitionCaches } from '@/features/seed-requisition/report/api/invalidate';
import type { SeedRequisitionResponse } from '@/features/seed-requisition/report/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'delete'],
    mutationFn: async (requisitionId: string) => {
      const { data } = await apiClient.delete<SeedRequisitionResponse>(
        `/v1/seed-requisitions/${requisitionId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async () => {
      await invalidateSeedRequisitionCaches(queryClient);
      toast.success('Seed requisition deleted', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to delete seed requisition. Please try again.'),
        {
          position: 'bottom-right',
        },
      );
    },
  });
}
