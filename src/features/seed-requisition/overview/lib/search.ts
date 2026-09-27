import { z } from 'zod';
import {
  SEED_REQUISITION_STATUSES,
  type SeedRequisitionListParams,
  toRequisitionDateParam,
} from '@/features/seed-requisition/overview/types';

const optionalId = z.string().min(1).optional().catch(undefined);
const optionalDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

export const seedRequisitionSearchSchema = z.object({
  status: z.enum(SEED_REQUISITION_STATUSES).optional().catch(undefined),
  farmerId: optionalId,
  varietyId: optionalId,
  requisitionDateFrom: optionalDay,
  requisitionDateTo: optionalDay,
});

export type SeedRequisitionSearch = z.infer<typeof seedRequisitionSearchSchema>;

export const DEFAULT_SEED_REQUISITION_SEARCH: SeedRequisitionSearch = {};

export function toListParams(search: SeedRequisitionSearch): SeedRequisitionListParams {
  return {
    ...(search.farmerId ? { farmerId: search.farmerId } : {}),
    ...(search.varietyId ? { varietyId: search.varietyId } : {}),
    ...(search.requisitionDateFrom
      ? { requisitionDateFrom: toRequisitionDateParam(search.requisitionDateFrom) }
      : {}),
    ...(search.requisitionDateTo
      ? { requisitionDateTo: toRequisitionDateParam(search.requisitionDateTo) }
      : {}),
  };
}

export function hasActiveFilters(search: SeedRequisitionSearch) {
  return Boolean(
    search.status ||
      search.farmerId ||
      search.varietyId ||
      search.requisitionDateFrom ||
      search.requisitionDateTo,
  );
}
