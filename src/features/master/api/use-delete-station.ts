import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { StationMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'delete-station'],
    mutationFn: async (stationId: string) => {
      const { data } = await apiClient.delete<StationMessageResponse>(
        `/v1/masters/stations/${stationId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success(data.message || 'Station deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete station. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
