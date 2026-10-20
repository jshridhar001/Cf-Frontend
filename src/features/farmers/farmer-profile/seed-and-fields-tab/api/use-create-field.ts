import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmerFieldKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  CreateFieldInput,
  FieldResponse,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['farmer-fields', 'create'],
    mutationFn: async (body: CreateFieldInput) => {
      const { data } = await apiClient.post<FieldResponse>('/v1/fields', body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (field) => {
      await queryClient.invalidateQueries({ queryKey: farmerFieldKeys.list() });
      toast.success('Field created', {
        description: `${field.name} has been added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create field. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
