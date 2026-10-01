import { queryOptions, useQuery } from '@tanstack/react-query';

import { seedDispatchKeys } from '@/features/seed-dispatch/api/query-keys';
import { mapSeedDispatchToRow } from '@/features/seed-dispatch/lib/map-seed-dispatch';
import type { SeedDispatch, SeedDispatchesResponse } from '@/features/seed-dispatch/types';
import { facilitiesQueryOptions } from '@/features/master/api/use-facilities';
import apiClient from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';

async function fetchSeedDispatches(): Promise<SeedDispatch[]> {
  const [response, facilities] = await Promise.all([
    apiClient.get<SeedDispatchesResponse>('/v1/seed-dispatches'),
    queryClient.ensureQueryData(facilitiesQueryOptions()),
  ]);

  const facilityNameById = new Map(facilities.map((facility) => [facility.id, facility.name]));
  return response.data.data.map((dispatch) => mapSeedDispatchToRow(dispatch, facilityNameById));
}

export function seedDispatchesQueryOptions() {
  return queryOptions({
    queryKey: seedDispatchKeys.list(),
    queryFn: fetchSeedDispatches,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useSeedDispatches() {
  return useQuery(seedDispatchesQueryOptions());
}
