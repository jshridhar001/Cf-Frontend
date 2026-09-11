import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type {
  SeedRequisitionResponse,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const reviewSeedRequisitionMutationKey = [...seedRequisitionKeys.all, 'review'] as const;

export type ReviewSeedRequisitionVariables = {
  requisitionId: string;
  status: Extract<SeedRequisitionStatus, 'APPROVED' | 'REJECTED'>;
  rejectionRemarks?: string;
};

export function useReviewSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: reviewSeedRequisitionMutationKey,
    mutationFn: async ({ requisitionId, ...body }: ReviewSeedRequisitionVariables) => {
      const { data } = await apiClient.patch<SeedRequisitionResponse>(
        `/v1/seed-requisitions/${requisitionId}/review`,
        body,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { requisitionId, status }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.all }),
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.detail(requisitionId) }),
      ]);
      toast.success(status === 'APPROVED' ? 'Requisition approved' : 'Requisition rejected', {
        description: data?.farmer?.name ? `${data.farmer.name} was updated.` : undefined,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to review requisition. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
