import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { ColdStorageGatePassResponse } from '../types';
import { csGatePassKeys } from './query-keys';

export function useNullifyGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cs-gate-pass', 'nullify'],
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<ColdStorageGatePassResponse>(
        `/v1/cold-storage-gate-passes/${id}/nullify`,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (gatePass) => {
      await queryClient.invalidateQueries({ queryKey: csGatePassKeys.all });
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilityStock() });
      toast.success('Gate pass marked as null', {
        description: `${gatePass.quantity} restored to ${gatePass.facility.name}.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Failed to mark the gate pass as null. Please try again.'),
        { position: 'bottom-right' },
      );
    },
  });
}
