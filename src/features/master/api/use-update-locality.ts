import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { LocalityResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateLocalityVariables = {
  localityId: string;
  name?: string;
  stationId?: string;
};

export function useUpdateLocality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'update-locality'],
    mutationFn: async ({ localityId, name, stationId }: UpdateLocalityVariables) => {
      const { data } = await apiClient.put<LocalityResponse>(
        `/v1/masters/localities/${localityId}`,
        {
          ...(name !== undefined ? { name } : {}),
          ...(stationId !== undefined ? { stationId } : {}),
        },
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (locality) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success('Locality updated successfully', {
        description: `${locality.name} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update locality. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
