import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { invalidateSeedRequisitionCaches } from '@/features/seed-requisition/report/api/invalidate';
import { mapSeedRequisitionToRow } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type {
  SeedRequisitionResponse,
  UpdateSeedRequisitionInput,
} from '@/features/seed-requisition/report/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateSeedRequisitionVariables = UpdateSeedRequisitionInput & {
  requisitionId: string;
};

export function useUpdateSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'update'],
    mutationFn: async ({ requisitionId, ...body }: UpdateSeedRequisitionVariables) => {
      const { data } = await apiClient.patch<SeedRequisitionResponse>(
        `/v1/seed-requisitions/${requisitionId}`,
        body,
      );
      return mapSeedRequisitionToRow(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (requisition) => {
      await invalidateSeedRequisitionCaches(queryClient);
      toast.success('Seed requisition updated', {
        description: `${requisition.farmer || 'Requisition'} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to update seed requisition. Please try again.'),
        {
          position: 'bottom-right',
        },
      );
    },
  });
}
