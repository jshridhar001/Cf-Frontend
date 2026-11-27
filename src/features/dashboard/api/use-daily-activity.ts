import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { dashboardKeys } from '@/features/dashboard/api/query-keys';
import type { DailyActivityResponse, FieldActivityDashboard } from '@/features/dashboard/types';
import apiClient from '@/lib/api-client';

async function fetchDailyActivity(
  from: string | undefined,
  to: string | undefined,
): Promise<FieldActivityDashboard> {
  const { data } = await apiClient.get<DailyActivityResponse>('/v1/dashboard/daily-activity', {
    params: {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
  });
  return data.data;
}

export function dailyActivityQueryOptions(from: string | undefined, to: string | undefined) {
  return queryOptions({
    queryKey: dashboardKeys.dailyActivity(from ?? null, to ?? null),
    queryFn: () => fetchDailyActivity(from, to),
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useDailyActivity(from: string | undefined, to: string | undefined) {
  return useQuery(dailyActivityQueryOptions(from, to));
}
