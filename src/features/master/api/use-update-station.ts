import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { StationResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateStationVariables = {
  stationId: string;
  name?: string;
  city?: string | null;
  state?: string | null;
};

export function useUpdateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'update-station'],
    mutationFn: async ({ stationId, name, city, state }: UpdateStationVariables) => {
      const { data } = await apiClient.put<StationResponse>(`/v1/masters/stations/${stationId}`, {
        ...(name !== undefined ? { name } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(state !== undefined ? { state } : {}),
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (station) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success('Station updated successfully', {
        description: `${station.name} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update station. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
