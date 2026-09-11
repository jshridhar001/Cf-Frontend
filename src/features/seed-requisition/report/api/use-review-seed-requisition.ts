import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { invalidateSeedRequisitionCaches } from '@/features/seed-requisition/report/api/invalidate';
import { mapSeedRequisitionToRow } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type {
  ReviewSeedRequisitionInput,
  SeedRequisitionResponse,
} from '@/features/seed-requisition/report/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type ReviewSeedRequisitionVariables = ReviewSeedRequisitionInput & {
  requisitionId: string;
};

export function useReviewSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'review'],
    mutationFn: async ({ requisitionId, ...body }: ReviewSeedRequisitionVariables) => {
      const { data } = await apiClient.patch<SeedRequisitionResponse>(
        `/v1/seed-requisitions/${requisitionId}/review`,
        body,
      );
      return mapSeedRequisitionToRow(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (requisition, variables) => {
      await invalidateSeedRequisitionCaches(queryClient);

      if (variables.status === 'APPROVED') {
        toast.success('Requisition approved', {
          description: `${requisition.farmer || 'Requisition'} was approved.`,
          position: 'bottom-right',
        });
      } else {
        toast.success('Requisition rejected', {
          description: `${requisition.farmer || 'Requisition'} was rejected.`,
          position: 'bottom-right',
        });
      }
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to review seed requisition. Please try again.'),
        {
          position: 'bottom-right',
        },
      );
    },
  });
}
