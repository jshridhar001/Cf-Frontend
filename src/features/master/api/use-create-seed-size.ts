import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import type { SeedSizeResponse } from '@/features/master/types';
import { formatSeedSize } from '@/lib/format-seed-size';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateSeedSizeVariables = {
  name: string;
  seedBagsPerAcre?: number;
};

export function useCreateSeedSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['master', 'create-seed-size'],
    mutationFn: async ({ name, seedBagsPerAcre }: CreateSeedSizeVariables) => {
      const { data } = await apiClient.post<SeedSizeResponse>('/v1/masters/seed-sizes', {
        name,
        ...(seedBagsPerAcre !== undefined ? { seedBagsPerAcre } : {}),
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (seedSize) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.seedSizes() });
      toast.success('Seed size created successfully', {
        description: `${formatSeedSize(seedSize.name)} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create seed size. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
