import { z } from 'zod';
import { SEED_DISPATCH_STATUSES } from '@/features/seed-dispatch/overview/types';

export const seedDispatchSearchSchema = z.object({
  status: z.enum(SEED_DISPATCH_STATUSES).optional().catch(undefined),
});

export type SeedDispatchSearch = z.infer<typeof seedDispatchSearchSchema>;

export const DEFAULT_SEED_DISPATCH_SEARCH: SeedDispatchSearch = {};

export function hasActiveFilters(search: SeedDispatchSearch) {
  return Boolean(search.status);
}
