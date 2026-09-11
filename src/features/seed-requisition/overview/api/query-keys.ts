import type { SeedRequisitionListParams } from '@/features/seed-requisition/overview/types';

export const seedRequisitionKeys = {
  all: ['seed-requisition'] as const,
  lists: () => [...seedRequisitionKeys.all, 'list'] as const,
  list: (params?: SeedRequisitionListParams) =>
    params ? ([...seedRequisitionKeys.lists(), params] as const) : seedRequisitionKeys.lists(),
  details: () => [...seedRequisitionKeys.all, 'detail'] as const,
  detail: (id: string) => [...seedRequisitionKeys.details(), id] as const,
};
