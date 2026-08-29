import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { TuberSizeResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { formatSeedSize } from '@/lib/format-seed-size';

export type UpdateTuberSizeVariables = {
  tuberSizeId: string;
  name: string;
};

export function useUpdateTuberSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'update-tuber-size'],
    mutationFn: async ({ tuberSizeId, name }: UpdateTuberSizeVariables) => {
      const { data } = await apiClient.put<TuberSizeResponse>(
        `/v1/masters/tuber-sizes/${tuberSizeId}`,
        { name },
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (tuberSize) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.tuberSizes() });
      toast.success('Tuber size updated successfully', {
        description: `${formatSeedSize(tuberSize.name)} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update tuber size. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
