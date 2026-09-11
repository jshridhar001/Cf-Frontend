import type { SeedRequisition } from '@/features/seed-requisition/overview/types';

export const REQUISITION_SORT_OPTIONS = [
  { value: 'farmer-asc', label: 'Farmer (A to Z)' },
  { value: 'farmer-desc', label: 'Farmer (Z to A)' },
  { value: 'date-desc', label: 'Date (Newest first)' },
  { value: 'date-asc', label: 'Date (Oldest first)' },
] as const;

export type RequisitionSortValue = (typeof REQUISITION_SORT_OPTIONS)[number]['value'];

export function isRequisitionSortValue(value: string): value is RequisitionSortValue {
  return REQUISITION_SORT_OPTIONS.some((option) => option.value === value);
}

function farmerName(requisition: SeedRequisition) {
  return requisition.farmer?.name ?? '';
}

export function filterAndSortRequisitions(
  requisitions: SeedRequisition[],
  search: string,
  sort: RequisitionSortValue,
): SeedRequisition[] {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? requisitions.filter((requisition) => {
        const name = farmerName(requisition).toLowerCase();
        const account = (requisition.farmer?.accountNumber ?? '').toLowerCase();
        const variety = (requisition.variety?.name ?? '').toLowerCase();
        return name.includes(query) || account.includes(query) || variety.includes(query);
      })
    : requisitions;

  return [...filtered].sort((a, b) => {
    switch (sort) {
      case 'farmer-desc':
        return farmerName(b).localeCompare(farmerName(a));
      case 'date-desc':
        return b.requisitionDate.localeCompare(a.requisitionDate);
      case 'date-asc':
        return a.requisitionDate.localeCompare(b.requisitionDate);
      default:
        return farmerName(a).localeCompare(farmerName(b));
    }
  });
}
