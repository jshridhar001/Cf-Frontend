import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type {
  CreateSeedRequisitionBody,
  SeedRequisitionDecisionResponse,
} from '@/features/seed-requisition/overview/types';
import { toSeedRequisition } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'create'],
    mutationFn: async (body: CreateSeedRequisitionBody) => {
      const { data } = await apiClient.post<SeedRequisitionDecisionResponse>(
        '/v1/seed-requisitions',
        body,
      );
      return toSeedRequisition(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (requisition) => {
      await queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() });
      const farmerName = requisition.farmer?.name;
      toast.success('Requisition created successfully', {
        description: farmerName ? `${farmerName} was added.` : undefined,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create requisition. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
