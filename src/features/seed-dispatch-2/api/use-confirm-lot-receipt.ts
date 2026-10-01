import { useMutation, useQueryClient } from '@tanstack/react-query';

import { farmerKeys } from '@/features/farmers/api/query-keys';
import { seedDispatchKeys } from '@/features/seed-dispatch/api/query-keys';
import type { ConfirmLotReceiptResponse } from '@/features/seed-dispatch/types';
import apiClient from '@/lib/api-client';

export type ConfirmLotReceiptVariables = {
  lotId: string;
  otp: string;
  dispatchId: string;
};

export function useConfirmLotReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['dispatch-lots', 'confirm'],
    mutationFn: async ({ lotId, otp }: ConfirmLotReceiptVariables) => {
      const { data } = await apiClient.post<ConfirmLotReceiptResponse>(
        `/dispatch-lots/${lotId}/confirm`,
        { otp },
      );
      if (!data.ok) {
        throw new Error(data.error);
      }
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (result, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.detail(variables.dispatchId) }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.list() }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.dispatchable() }),
      ];

      if (result.ok && result.farmerId) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: farmerKeys.detail(result.farmerId) }),
        );
      } else {
        invalidations.push(queryClient.invalidateQueries({ queryKey: farmerKeys.all }));
      }

      await Promise.all(invalidations);
    },
  });
}
