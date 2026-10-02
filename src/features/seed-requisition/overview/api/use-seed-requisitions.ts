import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  type SeedRequisition,
  type SeedRequisitionsResponse,
  toSeedRequisition,
} from '@/features/seed-requisition/overview/types';
import apiClient from '@/lib/api-client';
import { seedRequisitionKeys } from './query-keys';

async function fetchSeedRequisitions(): Promise<SeedRequisition[]> {
  const { data } = await apiClient.get<SeedRequisitionsResponse>('/v1/seed-requisitions');
  return data.data.map(toSeedRequisition);
}

export function seedRequisitionsQueryOptions() {
  return queryOptions({
    queryKey: seedRequisitionKeys.list(),
    queryFn: fetchSeedRequisitions,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedRequisitions(options?: { enabled?: boolean }) {
  return useQuery({
    ...seedRequisitionsQueryOptions(),
    enabled: options?.enabled ?? true,
  });
}
