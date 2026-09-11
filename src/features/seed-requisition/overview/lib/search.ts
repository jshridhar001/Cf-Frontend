import { z } from 'zod';
import {
  isSeedRequisitionPageSize,
  SEED_REQUISITION_PAGE_SIZE,
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
  page: z.coerce.number().int().min(1).default(1).catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .transform((value) => (isSeedRequisitionPageSize(value) ? value : SEED_REQUISITION_PAGE_SIZE))
    .default(SEED_REQUISITION_PAGE_SIZE)
    .catch(SEED_REQUISITION_PAGE_SIZE),
  status: z.enum(SEED_REQUISITION_STATUSES).optional().catch(undefined),
  farmerId: optionalId,
  varietyId: optionalId,
  requisitionDateFrom: optionalDay,
  requisitionDateTo: optionalDay,
});

export type SeedRequisitionSearch = z.infer<typeof seedRequisitionSearchSchema>;

export const DEFAULT_SEED_REQUISITION_SEARCH: SeedRequisitionSearch = {
  page: 1,
  pageSize: SEED_REQUISITION_PAGE_SIZE,
};

export function toListParams(search: SeedRequisitionSearch): SeedRequisitionListParams {
  return {
    page: search.page,
    pageSize: search.pageSize,
    ...(search.status ? { status: search.status } : {}),
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
