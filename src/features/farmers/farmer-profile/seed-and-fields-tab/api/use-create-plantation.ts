import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { plantationKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  CreatePlantationInput,
  PlantationResponse,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreatePlantation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['plantations', 'create'],
    mutationFn: async (body: CreatePlantationInput) => {
      const { data } = await apiClient.post<PlantationResponse>('/v1/plantations', body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (plantation) => {
      await queryClient.invalidateQueries({
        queryKey: plantationKeys.list(plantation.fieldId),
      });
      toast.success('Plantation added', {
        description: `${plantation.variety.name} has been recorded.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add plantation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
