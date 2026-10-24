import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dehaulmingKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  DehaulmingResponse,
  UpdateDehaulmingInput,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/dehaulming-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useUpdateDehaulming() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['dehaulmings', 'update'],
    mutationFn: async ({ id, ...body }: UpdateDehaulmingInput) => {
      const { data } = await apiClient.put<DehaulmingResponse>(`/v1/dehaulmings/${id}`, body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (dehaulming) => {
      await queryClient.invalidateQueries({
        queryKey: dehaulmingKeys.list(dehaulming.fieldId),
      });
      toast.success('Dehaulming updated', {
        description: `${dehaulming.startDate} to ${dehaulming.endDate} has been saved.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update dehaulming. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
