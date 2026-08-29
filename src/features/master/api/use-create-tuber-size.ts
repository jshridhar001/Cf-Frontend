import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { TuberSizeResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { formatSeedSize } from '@/lib/format-seed-size';

export type CreateTuberSizeVariables = {
  name: string;
};

export function useCreateTuberSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'create-tuber-size'],
    mutationFn: async ({ name }: CreateTuberSizeVariables) => {
      const { data } = await apiClient.post<TuberSizeResponse>('/v1/masters/tuber-sizes', {
        name,
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (tuberSize) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.tuberSizes() });
      toast.success('Tuber size created successfully', {
        description: `${formatSeedSize(tuberSize.name)} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create tuber size. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
