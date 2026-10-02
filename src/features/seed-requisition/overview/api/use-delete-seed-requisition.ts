import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionMessageResponse } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteSeedRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'delete'],
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<SeedRequisitionMessageResponse>(
        `/v1/seed-requisitions/${id}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
      ]);
      toast.success(data.message || 'Seed requisition deleted successfully.', {
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
