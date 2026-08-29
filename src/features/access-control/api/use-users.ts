import { queryOptions, useQuery } from '@tanstack/react-query';
import type { AccessControlUser, AccessControlUsersResponse } from '@/features/types';
import apiClient from '@/lib/api-client';
import { accessControlKeys } from './query-keys';

async function fetchUsers(): Promise<AccessControlUser[]> {
  const { data } = await apiClient.get<AccessControlUsersResponse>('/v1/access-control/users');
  return data.data;
}

export function usersQueryOptions() {
  return queryOptions({
    queryKey: accessControlKeys.users(),
    queryFn: fetchUsers,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useUsers() {
  return useQuery(usersQueryOptions());
}
