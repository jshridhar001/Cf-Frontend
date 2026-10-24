import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dehaulmingKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  CreateDehaulmingInput,
  DehaulmingResponse,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/dehaulming-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateDehaulming() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['dehaulmings', 'create'],
    mutationFn: async (body: CreateDehaulmingInput) => {
      const { data } = await apiClient.post<DehaulmingResponse>('/v1/dehaulmings', body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (dehaulming) => {
      await queryClient.invalidateQueries({
        queryKey: dehaulmingKeys.list(dehaulming.fieldId),
      });
      toast.success('Dehaulming added', {
        description: `${dehaulming.startDate} to ${dehaulming.endDate} has been recorded.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add dehaulming. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
