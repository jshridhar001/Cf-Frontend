import { queryOptions, useQuery } from '@tanstack/react-query';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import { SAMPLE_SEED_DISPATCHES } from '@/features/seed-dispatch/overview/lib/sample-data';
import type {
  SeedDispatch,
  SeedDispatchListMeta,
  SeedDispatchListParams,
} from '@/features/seed-dispatch/overview/types';

export type SeedDispatchListResult = {
  items: SeedDispatch[];
  meta: SeedDispatchListMeta;
};

async function fetchSeedDispatches(
  _params: SeedDispatchListParams,
): Promise<SeedDispatchListResult> {
  // Dummy data until the dispatch list API is wired.
  await new Promise((resolve) => setTimeout(resolve, 200));
  const items = SAMPLE_SEED_DISPATCHES;
  return {
    items,
    meta: {
      page: 1,
      pageSize: items.length,
      total: items.length,
    },
  };
}

export function seedDispatchesQueryOptions(params: SeedDispatchListParams) {
  return queryOptions({
    queryKey: seedDispatchKeys.list(params),
    queryFn: () => fetchSeedDispatches(params),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedDispatches(params: SeedDispatchListParams = {}) {
  return useQuery(seedDispatchesQueryOptions(params));
}
