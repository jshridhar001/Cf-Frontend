import { queryOptions, useQuery } from '@tanstack/react-query';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type {
  SeedRequisition,
  SeedRequisitionListMeta,
  SeedRequisitionListParams,
  SeedRequisitionsResponse,
} from '@/features/seed-requisition/overview/types';
import { SEED_REQUISITION_PAGE_SIZE } from '@/features/seed-requisition/overview/types';
import apiClient from '@/lib/api-client';

export type SeedRequisitionListResult = {
  items: SeedRequisition[];
  meta: SeedRequisitionListMeta;
};

function compactParams(params: SeedRequisitionListParams) {
  return {
    page: params.page,
    pageSize: params.pageSize,
    ...(params.status ? { status: params.status } : {}),
    ...(params.farmerId ? { farmerId: params.farmerId } : {}),
    ...(params.varietyId ? { varietyId: params.varietyId } : {}),
    ...(params.requisitionDateFrom ? { requisitionDateFrom: params.requisitionDateFrom } : {}),
    ...(params.requisitionDateTo ? { requisitionDateTo: params.requisitionDateTo } : {}),
  };
}

async function fetchSeedRequisitions(
  params: SeedRequisitionListParams,
): Promise<SeedRequisitionListResult> {
  const { data } = await apiClient.get<SeedRequisitionsResponse>('/v1/seed-requisitions', {
    params: compactParams(params),
  });
  return {
    items: data.data ?? [],
    meta: data.meta ?? {
      page: params.page,
      pageSize: params.pageSize,
      total: data.data?.length ?? 0,
    },
  };
}

export function seedRequisitionsQueryOptions(params: SeedRequisitionListParams) {
  return queryOptions({
    queryKey: seedRequisitionKeys.list(params),
    queryFn: () => fetchSeedRequisitions(params),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedRequisitions(params: SeedRequisitionListParams) {
  return useQuery(seedRequisitionsQueryOptions(params));
}

export { SEED_REQUISITION_PAGE_SIZE };
