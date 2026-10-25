import { useQuery } from '@tanstack/react-query';
import { fieldTaskKeys } from '@/features/task-manager/api/query-keys';
import type { FieldTasksResponse } from '@/features/task-manager/types';
import apiClient from '@/lib/api-client';

export function useFieldTasks() {
  return useQuery({
    queryKey: fieldTaskKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<FieldTasksResponse>('/v1/field-tasks');
      return data.data;
    },
    retry: false,
  });
}

export function useOfficerFieldTasks(officerId: string) {
  return useQuery({
    queryKey: fieldTaskKeys.officer(officerId),
    queryFn: async () => {
      const { data } = await apiClient.get<FieldTasksResponse>(
        `/v1/field-tasks/officers/${officerId}`,
      );
      return data.data;
    },
    retry: false,
    enabled: officerId.length > 0,
  });
}
