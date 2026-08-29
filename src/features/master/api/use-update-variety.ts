import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { VarietyResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateVarietyVariables = {
  varietyId: string;
  name: string;
};

export function useUpdateVariety() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'update-variety'],
    mutationFn: async ({ varietyId, name }: UpdateVarietyVariables) => {
      const { data } = await apiClient.put<VarietyResponse>(`/v1/masters/varieties/${varietyId}`, {
        name,
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (variety) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.varieties() });
      toast.success('Variety updated successfully', {
        description: `${variety.name} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update variety. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
