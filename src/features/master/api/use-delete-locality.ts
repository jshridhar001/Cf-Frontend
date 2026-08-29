import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { LocalityMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteLocality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-locality'],
    mutationFn: async (localityId: string) => {
      const { data } = await apiClient.delete<LocalityMessageResponse>(
        `/v1/masters/localities/${localityId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success(data.message || 'Locality deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete locality. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
