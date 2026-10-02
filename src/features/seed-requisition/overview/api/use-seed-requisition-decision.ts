import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionDecisionResponse } from '@/features/seed-requisition/overview/types';
import { toSeedRequisition } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type SeedRequisitionDecisionVariables =
  | {
      requisitionId: string;
      decision: 'APPROVED';
      approvedDeliveryDate: string;
    }
  | {
      requisitionId: string;
      decision: 'REJECTED';
      rejectionRemarks: string;
    };

export function useSeedRequisitionDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'decision'],
    mutationFn: async (variables: SeedRequisitionDecisionVariables) => {
      const body =
        variables.decision === 'APPROVED'
          ? {
              decision: variables.decision,
              approvedDeliveryDate: variables.approvedDeliveryDate,
            }
          : {
              decision: variables.decision,
              rejectionRemarks: variables.rejectionRemarks,
            };
      const { data } = await apiClient.patch<SeedRequisitionDecisionResponse>(
        `/v1/seed-requisitions/${variables.requisitionId}/decision`,
        body,
      );
      return toSeedRequisition(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (requisition, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
      ]);
      const farmerName = requisition.farmer?.name;
      toast.success(
        variables.decision === 'APPROVED' ? 'Requisition approved' : 'Requisition rejected',
        {
          description: farmerName ? `${farmerName} was updated.` : undefined,
          position: 'bottom-right',
        },
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update requisition. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
