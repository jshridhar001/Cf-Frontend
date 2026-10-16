import { queryOptions, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ColdStorageGatePass, ColdStorageGatePassesResponse } from '../types';
import { csGatePassKeys } from './query-keys';

async function fetchGatePasses(): Promise<ColdStorageGatePass[]> {
  const { data } = await apiClient.get<ColdStorageGatePassesResponse>(
    '/v1/cold-storage-gate-passes',
  );
  return data.data;
}

export function gatePassesQueryOptions() {
  return queryOptions({
    queryKey: csGatePassKeys.list(),
    queryFn: fetchGatePasses,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useGatePasses() {
  return useQuery(gatePassesQueryOptions());
}
