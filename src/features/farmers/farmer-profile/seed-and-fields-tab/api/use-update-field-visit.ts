import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fieldVisitKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  FieldVisitResponse,
  UpdateFieldVisitInput,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-visit-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useUpdateFieldVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['field-visits', 'update'],
    mutationFn: async ({ id, ...body }: UpdateFieldVisitInput) => {
      const { data } = await apiClient.put<FieldVisitResponse>(`/v1/field-visits/${id}`, body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (visit) => {
      await queryClient.invalidateQueries({
        queryKey: fieldVisitKeys.list(visit.fieldId),
      });
      toast.success('Field visit updated', {
        description: `${visit.startDate} to ${visit.endDate} has been saved.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update field visit. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
