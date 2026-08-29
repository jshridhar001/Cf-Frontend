import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { StationResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateStationVariables = {
  name: string;
  city?: string | null;
  state?: string | null;
};

export function useCreateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'create-station'],
    mutationFn: async ({ name, city, state }: CreateStationVariables) => {
      const { data } = await apiClient.post<StationResponse>('/v1/masters/stations', {
        name,
        ...(city !== undefined ? { city } : {}),
        ...(state !== undefined ? { state } : {}),
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (station) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success('Station created successfully', {
        description: `${station.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create station. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
