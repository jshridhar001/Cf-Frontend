import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionResponse } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const updateSeedRequisitionMutationKey = [...seedRequisitionKeys.all, 'update'] as const;

export type UpdateSeedRequisitionVariables = {
  requisitionId: string;
  requestedBags?: number | null;
  requestedAcres?: string | null;
  requestedDeliveryDate?: string;
  remarks?: string | null;
};

export function useUpdateSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateSeedRequisitionMutationKey,
    mutationFn: async ({ requisitionId, ...body }: UpdateSeedRequisitionVariables) => {
      const { data } = await apiClient.patch<SeedRequisitionResponse>(
        `/v1/seed-requisitions/${requisitionId}`,
        body,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (_data, { requisitionId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.all }),
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.detail(requisitionId) }),
      ]);
      toast.success('Requisition updated successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update requisition. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
