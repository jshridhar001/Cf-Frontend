import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type NullifySeedDispatchResponse = {
  success: boolean;
  data: {
    id: string;
    status: string;
  };
};

export type NullifySeedDispatchVariables = {
  dispatchId: string;
  truckNumber?: string | null;
};

export function useNullifySeedDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-dispatch', 'nullify'],
    mutationFn: async ({ dispatchId }: NullifySeedDispatchVariables) => {
      const { data } = await apiClient.patch<NullifySeedDispatchResponse>(
        `/v1/seed-dispatches/${dispatchId}/nullify`,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.list() }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.detail(variables.dispatchId) }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.dispatchable() }),
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
      ]);
      toast.success('Dispatch marked as null', {
        description: variables.truckNumber?.trim()
          ? `Truck ${variables.truckNumber.trim()} has been nulled.`
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
