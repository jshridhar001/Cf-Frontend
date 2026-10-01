import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { seedDispatchKeys } from '@/features/seed-dispatch/api/query-keys';
import type {
  SeedDispatchResponse,
  UpdateSeedDispatchStatusInput,
} from '@/features/seed-dispatch/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateSeedDispatchStatusVariables = UpdateSeedDispatchStatusInput & {
  dispatchId: string;
  truckNumber?: string;
};

export function useUpdateSeedDispatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-dispatches', 'update-status'],
    mutationFn: async ({
      dispatchId,
      truckNumber: _truckNumber,
      ...body
    }: UpdateSeedDispatchStatusVariables) => {
      const { data } = await apiClient.patch<SeedDispatchResponse>(
        `/v1/seed-dispatches/${dispatchId}/status`,
        body,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (dispatch, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: seedDispatchKeys.detail(variables.dispatchId),
        }),
      ]);

      const label = variables.status === 'DELIVERED' ? 'delivered' : 'in transit';
      toast.success(`Dispatch marked as ${label}`, {
        description: variables.truckNumber
          ? `Truck ${variables.truckNumber}`
          : `Dispatch ${dispatch.id}`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to update dispatch status. Please try again.'),
        { position: 'bottom-right' },
      );
    },
  });
}
