import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { LocalityResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateLocalityVariables = {
  name: string;
  stationId: string;
};

export function useCreateLocality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'create-locality'],
    mutationFn: async ({ name, stationId }: CreateLocalityVariables) => {
      const { data } = await apiClient.post<LocalityResponse>('/v1/masters/localities', {
        name,
        stationId,
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (locality) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success('Locality created successfully', {
        description: `${locality.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create locality. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
