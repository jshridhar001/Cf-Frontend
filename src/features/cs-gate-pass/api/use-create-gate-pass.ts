import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { ColdStorageGatePassResponse } from '../types';
import { csGatePassKeys } from './query-keys';

export type CreateGatePassVariables = {
  facilityId: string;
  gatePassDate: string;
  varietyId: string;
  generationId: string;
  sizeId: string;
  quantity: number;
};

export function useCreateGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cs-gate-pass', 'create'],
    mutationFn: async (variables: CreateGatePassVariables) => {
      const { data } = await apiClient.post<ColdStorageGatePassResponse>(
        '/v1/cold-storage-gate-passes',
        variables,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (gatePass) => {
      await queryClient.invalidateQueries({ queryKey: csGatePassKeys.all });
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilityStock() });
      toast.success('Gate pass created', {
        description: `${gatePass.quantity} removed from ${gatePass.facility.name}.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create the gate pass. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
