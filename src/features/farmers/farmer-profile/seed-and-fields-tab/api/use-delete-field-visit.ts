import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fieldVisitKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type { FieldVisitMessageResponse } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-visit-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteFieldVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['field-visits', 'delete'],
    mutationFn: async ({ id }: { id: string; fieldId: string }) => {
      const { data } = await apiClient.delete<FieldVisitMessageResponse>(`/v1/field-visits/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { fieldId }) => {
      await queryClient.invalidateQueries({ queryKey: fieldVisitKeys.list(fieldId) });
      toast.success(data.message || 'Field visit deleted successfully.', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete field visit. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
