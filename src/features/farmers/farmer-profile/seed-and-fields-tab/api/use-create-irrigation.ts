import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { irrigationKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  CreateIrrigationInput,
  IrrigationResponse,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/irrigation-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateIrrigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['irrigations', 'create'],
    mutationFn: async (body: CreateIrrigationInput) => {
      const { data } = await apiClient.post<IrrigationResponse>('/v1/irrigations', body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (irrigation) => {
      await queryClient.invalidateQueries({
        queryKey: irrigationKeys.list(irrigation.fieldId),
      });
      toast.success('Irrigation added', {
        description: `Cycle ${irrigation.cycleNumber} has been recorded.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add irrigation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
