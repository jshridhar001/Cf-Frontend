import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionResponse } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const createSeedRequisitionMutationKey = [...seedRequisitionKeys.all, 'create'] as const;

export type CreateSeedRequisitionVariables = {
  farmerId: string;
  varietyId: string;
  requestedBags?: number;
  requestedAcres?: string;
  requisitionDate: string;
  requestedDeliveryDate: string;
  remarks?: string;
};

export function useCreateSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createSeedRequisitionMutationKey,
    mutationFn: async (variables: CreateSeedRequisitionVariables) => {
      const { data } = await apiClient.post<SeedRequisitionResponse>(
        '/v1/seed-requisitions',
        variables,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.all });
      toast.success('Requisition created successfully', {
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
