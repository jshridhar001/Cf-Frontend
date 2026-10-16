import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { ColdStorageGatePassResponse } from '../types';
import { csGatePassKeys } from './query-keys';
import type { CreateGatePassVariables } from './use-create-gate-pass';

export type UpdateGatePassVariables = CreateGatePassVariables & {
  id: string;
};

export function useUpdateGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cs-gate-pass', 'update'],
    mutationFn: async ({ id, ...body }: UpdateGatePassVariables) => {
      const { data } = await apiClient.put<ColdStorageGatePassResponse>(
        `/v1/cold-storage-gate-passes/${id}`,
        body,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: csGatePassKeys.all });
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilityStock() });
      toast.success('Gate pass updated', { position: 'bottom-right' });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update the gate pass. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
