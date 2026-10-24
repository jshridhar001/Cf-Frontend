import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rougingKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  RougingResponse,
  UpdateRougingInput,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/rouging-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useUpdateRouging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['rougings', 'update'],
    mutationFn: async ({ id, ...body }: UpdateRougingInput) => {
      const { data } = await apiClient.put<RougingResponse>(`/v1/rougings/${id}`, body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (rouging) => {
      await queryClient.invalidateQueries({
        queryKey: rougingKeys.list(rouging.fieldId),
      });
      toast.success('Rouging updated', {
        description: `${rouging.startDate} to ${rouging.endDate} has been saved.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update rouging. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
