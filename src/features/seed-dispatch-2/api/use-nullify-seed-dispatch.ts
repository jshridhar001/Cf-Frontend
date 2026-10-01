import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { farmerKeys } from '@/features/farmers/api/query-keys';
import { seedDispatchKeys } from '@/features/seed-dispatch/api/query-keys';
import type { SeedDispatchMessageResponse } from '@/features/seed-dispatch/types';
import { seedRequisitionKeys } from '@/features/seed-requisition/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type NullifySeedDispatchVariables = {
  dispatchId: string;
  truckNumber?: string;
};

export function useNullifySeedDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-dispatches', 'nullify'],
    mutationFn: async ({ dispatchId }: NullifySeedDispatchVariables) => {
      const { data } = await apiClient.patch<SeedDispatchMessageResponse>(
        `/v1/seed-dispatches/${dispatchId}/nullify`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.list() }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.dispatchable() }),
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: seedDispatchKeys.detail(variables.dispatchId),
        }),
        queryClient.invalidateQueries({ queryKey: farmerKeys.all }),
      ]);
      toast.success(result.message || 'Dispatch marked as null', {
        description: variables.truckNumber
          ? `Truck ${variables.truckNumber} has been nulled.`
          : undefined,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to nullify dispatch. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
