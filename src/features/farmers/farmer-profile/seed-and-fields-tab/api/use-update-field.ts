import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmerFieldKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  FieldResponse,
  UpdateFieldInput,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateFieldVariables = {
  id: string;
  body: UpdateFieldInput;
};

export function useUpdateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['farmer-fields', 'update'],
    mutationFn: async ({ id, body }: UpdateFieldVariables) => {
      const { data } = await apiClient.put<FieldResponse>(`/v1/fields/${id}`, body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (field) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmerFieldKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmerFieldKeys.detail(field.id) }),
      ]);
      toast.success('Field updated', {
        description: `${field.name} was saved.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update field. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
