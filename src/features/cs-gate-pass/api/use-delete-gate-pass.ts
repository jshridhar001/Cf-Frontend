import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { ColdStorageGatePassMessageResponse } from '../types';
import { csGatePassKeys } from './query-keys';

export function useDeleteGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cs-gate-pass', 'delete'],
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ColdStorageGatePassMessageResponse>(
        `/v1/cold-storage-gate-passes/${id}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: csGatePassKeys.all });
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilityStock() });
      toast.success(data.message || 'Gate pass deleted', { position: 'bottom-right' });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete the gate pass. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
