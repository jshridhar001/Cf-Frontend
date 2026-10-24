import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rougingKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  CreateRougingInput,
  RougingResponse,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/rouging-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateRouging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['rougings', 'create'],
    mutationFn: async (body: CreateRougingInput) => {
      const { data } = await apiClient.post<RougingResponse>('/v1/rougings', body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (rouging) => {
      await queryClient.invalidateQueries({
        queryKey: rougingKeys.list(rouging.fieldId),
      });
      toast.success('Rouging added', {
        description: `${rouging.startDate} to ${rouging.endDate} has been recorded.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add rouging. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
