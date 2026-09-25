import { queryOptions, useQuery } from '@tanstack/react-query';
import { masterKeys } from '@/features/master/api/query-keys';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import type { NamedMastersResponse } from '@/features/master/types';
import apiClient from '@/lib/api-client';

async function fetchNamedMasters(resourceId: AddressMasterId) {
  const resource = getAddressMaster(resourceId);
  const { data } = await apiClient.get<NamedMastersResponse>(resource.path);
  return data.data;
}

export function namedMastersQueryOptions(resourceId: AddressMasterId) {
  return queryOptions({
    queryKey: masterKeys.addressMasters(resourceId),
    queryFn: () => fetchNamedMasters(resourceId),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useNamedMasters(resourceId: AddressMasterId) {
  return useQuery(namedMastersQueryOptions(resourceId));
}
