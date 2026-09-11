import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionListResult } from '@/features/seed-requisition/overview/api/use-seed-requisitions';
import type {
  SeedRequisition,
  SeedRequisitionResponse,
} from '@/features/seed-requisition/overview/types';
import apiClient from '@/lib/api-client';

async function fetchSeedRequisition(id: string): Promise<SeedRequisition> {
  const { data } = await apiClient.get<SeedRequisitionResponse>(`/v1/seed-requisitions/${id}`);
  return data.data;
}

export function seedRequisitionQueryOptions(id: string) {
  return queryOptions({
    queryKey: seedRequisitionKeys.detail(id),
    queryFn: () => fetchSeedRequisition(id),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedRequisition(id: string, enabled = true) {
  const queryClient = useQueryClient();

  return useQuery({
    ...seedRequisitionQueryOptions(id),
    enabled: enabled && id.length > 0,
    initialData: () => {
      const matches = queryClient.getQueriesData<SeedRequisitionListResult>({
        queryKey: seedRequisitionKeys.lists(),
      });
      for (const [, data] of matches) {
        const found = data?.items.find((requisition) => requisition.id === id);
        if (found) return found;
      }
      return undefined;
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(seedRequisitionKeys.lists())?.dataUpdatedAt,
  });
}
