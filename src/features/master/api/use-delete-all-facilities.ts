import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { FacilityMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteAllFacilities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-all-facilities'],
    mutationFn: async () => {
      const { data } = await apiClient.delete<FacilityMessageResponse>(
        '/v1/masters/facilities/all',
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilities() });
      toast.success(data.message || 'All facilities deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete facilities. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
