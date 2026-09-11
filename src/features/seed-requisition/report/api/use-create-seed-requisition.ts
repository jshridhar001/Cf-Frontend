import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { invalidateSeedRequisitionCaches } from '@/features/seed-requisition/report/api/invalidate';
import { mapSeedRequisitionToRow } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type {
  CreateSeedRequisitionInput,
  SeedRequisitionResponse,
} from '@/features/seed-requisition/report/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateSeedRequisitionVariables = CreateSeedRequisitionInput;

export function useCreateSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'create'],
    mutationFn: async (variables: CreateSeedRequisitionVariables) => {
      const { data } = await apiClient.post<SeedRequisitionResponse>(
        '/v1/seed-requisitions',
        variables,
      );
      return mapSeedRequisitionToRow(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (requisition) => {
      await invalidateSeedRequisitionCaches(queryClient);
      toast.success('Seed requisition created', {
        description: `${requisition.farmer || 'Requisition'} — ${requisition.variety || 'variety'}`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to create seed requisition. Please try again.'),
        {
          position: 'bottom-right',
        },
      );
    },
  });
}
