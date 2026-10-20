import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmerFieldKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { FieldMessageResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['farmer-fields', 'delete'],
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<FieldMessageResponse>(`/v1/fields/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmerFieldKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmerFieldKeys.detail(id) }),
      ]);
      toast.success(data.message || 'Field deleted successfully.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete field. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
