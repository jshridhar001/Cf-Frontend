import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { irrigationKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  IrrigationResponse,
  UpdateIrrigationInput,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/irrigation-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useUpdateIrrigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['irrigations', 'update'],
    mutationFn: async ({ id, ...body }: UpdateIrrigationInput) => {
      const { data } = await apiClient.put<IrrigationResponse>(`/v1/irrigations/${id}`, body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (irrigation) => {
      await queryClient.invalidateQueries({
        queryKey: irrigationKeys.list(irrigation.fieldId),
      });
      toast.success('Irrigation updated', {
        description: `Cycle ${irrigation.cycleNumber} has been saved.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update irrigation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
