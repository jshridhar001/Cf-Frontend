import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { plantationKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  PlantationResponse,
  UpdatePlantationInput,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useUpdatePlantation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['plantations', 'update'],
    mutationFn: async ({ id, ...body }: UpdatePlantationInput) => {
      const { data } = await apiClient.put<PlantationResponse>(`/v1/plantations/${id}`, body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (plantation) => {
      await queryClient.invalidateQueries({
        queryKey: plantationKeys.list(plantation.fieldId),
      });
      toast.success('Plantation updated', {
        description: `${plantation.variety.name} has been saved.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update plantation. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
