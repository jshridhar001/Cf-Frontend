import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type UpdateSeedDispatchStatusResponse = {
  success: boolean;
  data: {
    id: string;
    status: string;
    remarks?: string | null;
  };
};

export type UpdateSeedDispatchStatusVariables = {
  dispatchId: string;
  truckNumber?: string | null;
  remarks?: string;
};

export function useUpdateSeedDispatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-dispatch', 'update-status'],
    mutationFn: async ({ dispatchId, remarks }: UpdateSeedDispatchStatusVariables) => {
      const { data } = await apiClient.patch<UpdateSeedDispatchStatusResponse>(
        `/v1/seed-dispatches/${dispatchId}/status`,
        remarks ? { status: 'DELIVERED', remarks } : { status: 'DELIVERED' },
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (_dispatch, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.list() }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.detail(variables.dispatchId) }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.dispatchable() }),
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() }),
      ]);
      toast.success('Dispatch marked as delivered', {
        description: variables.truckNumber?.trim()
          ? `Truck ${variables.truckNumber.trim()}`
          : undefined,
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
