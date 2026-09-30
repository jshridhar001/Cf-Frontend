import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type {
  CreateSeedRequisitionBody,
  SeedRequisitionDecisionResponse,
} from '@/features/seed-requisition/overview/types';
import { toSeedRequisition } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useUpdateSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'update'],
    mutationFn: async ({
      requisitionId,
      body,
    }: {
      requisitionId: string;
      body: CreateSeedRequisitionBody;
    }) => {
      const { data } = await apiClient.put<SeedRequisitionDecisionResponse>(
        `/v1/seed-requisitions/${requisitionId}`,
        body,
      );
      return toSeedRequisition(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (requisition) => {
      queryClient.setQueryData(seedRequisitionKeys.detail(requisition.id), requisition);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() }),
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.detail(requisition.id) }),
      ]);
      const farmerName = requisition.farmer?.name;
      toast.success('Requisition updated successfully', {
        description: farmerName ? `${farmerName} was updated.` : undefined,
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
