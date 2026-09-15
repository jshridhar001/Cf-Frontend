import type { SeedDispatchListParams } from '@/features/seed-dispatch/overview/types';

export const seedDispatchKeys = {
  all: ['seed-dispatch'] as const,
  lists: () => [...seedDispatchKeys.all, 'list'] as const,
  list: (params?: SeedDispatchListParams) =>
    params ? ([...seedDispatchKeys.lists(), params] as const) : seedDispatchKeys.lists(),
  details: () => [...seedDispatchKeys.all, 'detail'] as const,
  detail: (id: string) => [...seedDispatchKeys.details(), id] as const,
};
