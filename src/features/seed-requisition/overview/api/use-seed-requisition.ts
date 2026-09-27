import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type ApiSeedRequisition,
  type SeedRequisition,
  toSeedRequisition,
} from '@/features/seed-requisition/overview/types';
import apiClient from '@/lib/api-client';
import { seedRequisitionKeys } from './query-keys';

type SeedRequisitionDetailResponse = {
  success: boolean;
  data: ApiSeedRequisition;
};

async function fetchSeedRequisition(id: string): Promise<SeedRequisition> {
  const { data } = await apiClient.get<SeedRequisitionDetailResponse>(
    `/v1/seed-requisitions/${id}`,
  );
  return toSeedRequisition(data.data);
}

export function seedRequisitionQueryOptions(id: string) {
  return queryOptions({
    queryKey: seedRequisitionKeys.detail(id),
    queryFn: () => fetchSeedRequisition(id),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedRequisition(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    ...seedRequisitionQueryOptions(id),
    placeholderData: () =>
      queryClient
        .getQueryData<SeedRequisition[]>(seedRequisitionKeys.list())
        ?.find((row) => row.id === id),
  });
}
