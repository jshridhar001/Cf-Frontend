import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionResponse } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const deleteSeedRequisitionMutationKey = [...seedRequisitionKeys.all, 'delete'] as const;

export function useDeleteSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteSeedRequisitionMutationKey,
    mutationFn: async (requisitionId: string) => {
      const { data } = await apiClient.delete<SeedRequisitionResponse>(
        `/v1/seed-requisitions/${requisitionId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (_data, requisitionId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.all }),
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.detail(requisitionId) }),
      ]);
      toast.success('Requisition deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete requisition. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
