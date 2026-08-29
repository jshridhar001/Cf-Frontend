import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { FacilityResponse, FacilityUsedIn } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateFacilityVariables = {
  name: string;
  usedIn: FacilityUsedIn;
};

export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'create-facility'],
    mutationFn: async ({ name, usedIn }: CreateFacilityVariables) => {
      const { data } = await apiClient.post<FacilityResponse>('/v1/masters/facilities', {
        name,
        usedIn,
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (facility) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.facilities() });
      toast.success('Facility created successfully', {
        description: `${facility.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create facility. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
