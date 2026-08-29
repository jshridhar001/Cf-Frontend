import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { SeedSizeResponse } from '@/features/master/types';
import { formatSeedSize } from '@/lib/format-seed-size';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateSeedSizeVariables = {
  seedSizeId: string;
  name: string;
  seedBagsPerAcre: number | null;
};

export function useUpdateSeedSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'update-seed-size'],
    mutationFn: async ({ seedSizeId, name, seedBagsPerAcre }: UpdateSeedSizeVariables) => {
      const { data } = await apiClient.put<SeedSizeResponse>(
        `/v1/masters/seed-sizes/${seedSizeId}`,
        { name, seedBagsPerAcre },
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (seedSize) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.seedSizes() });
      toast.success('Seed size updated successfully', {
        description: `${formatSeedSize(seedSize.name)} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update seed size. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
