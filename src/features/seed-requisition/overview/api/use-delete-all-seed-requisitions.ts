import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionMessageResponse } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const deleteAllSeedRequisitionsMutationKey = [
  ...seedRequisitionKeys.all,
  'delete-all',
] as const;

export function useDeleteAllSeedRequisitions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteAllSeedRequisitionsMutationKey,
    mutationFn: async () => {
      const { data } =
        await apiClient.delete<SeedRequisitionMessageResponse>('/v1/seed-requisitions');
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.all });
      toast.success(data.message || 'All requisitions deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete requisitions. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
