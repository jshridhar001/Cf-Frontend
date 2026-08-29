import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { FacilityResponse, FacilityUsedIn } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateFacilityVariables = {
  facilityId: string;
  name: string;
  usedIn: FacilityUsedIn;
};

export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'update-facility'],
    mutationFn: async ({ facilityId, name, usedIn }: UpdateFacilityVariables) => {
      const { data } = await apiClient.put<FacilityResponse>(
        `/v1/masters/facilities/${facilityId}`,
        { name, usedIn },
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (facility) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilities() });
      toast.success('Facility updated successfully', {
        description: `${facility.name} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update facility. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
