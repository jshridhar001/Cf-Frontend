import { useMutation, useQueryClient } from '@tanstack/react-query';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import apiClient from '@/lib/api-client';

type ConfirmLotReceiptResponse = {
  success: boolean;
  data: {
    farmerId?: string;
    alreadyReceived?: boolean;
  };
};

export type ConfirmLotReceiptVariables = {
  lotId: string;
  otp: string;
  dispatchId: string;
};

export function useConfirmLotReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-dispatch', 'confirm-lot'],
    mutationFn: async ({ lotId, otp }: ConfirmLotReceiptVariables) => {
      const { data } = await apiClient.post<ConfirmLotReceiptResponse>(
        `/v1/seed-dispatches/${lotId}/confirm`,
        { otp },
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
    },
  });
}
