import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fieldVisitKeys } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/query-keys';
import type {
  CreateFieldVisitInput,
  FieldVisitResponse,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-visit-types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useCreateFieldVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['field-visits', 'create'],
    mutationFn: async (body: CreateFieldVisitInput) => {
      const { data } = await apiClient.post<FieldVisitResponse>('/v1/field-visits', body);
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (visit) => {
      await queryClient.invalidateQueries({
        queryKey: fieldVisitKeys.list(visit.fieldId),
      });
      toast.success('Field visit added', {
        description: `${visit.startDate} to ${visit.endDate} has been recorded.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add field visit. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
