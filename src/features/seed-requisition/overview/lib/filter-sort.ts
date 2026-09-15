import type {
  SeedRequisition,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

function farmerName(requisition: SeedRequisition) {
  return requisition.farmer?.name ?? '';
}

export function filterAndSortRequisitions(
  requisitions: SeedRequisition[],
  search: string,
  status?: SeedRequisitionStatus,
): SeedRequisition[] {
  const query = search.trim().toLowerCase();
  return requisitions.filter((requisition) => {
    if (status && requisition.status !== status) return false;
    if (!query) return true;
    const name = farmerName(requisition).toLowerCase();
    const account = (requisition.farmer?.accountNumber ?? '').toLowerCase();
    const station = (requisition.farmer?.station?.name ?? '').toLowerCase();
    const variety = (requisition.variety?.name ?? '').toLowerCase();
    return (
      name.includes(query) ||
      account.includes(query) ||
      station.includes(query) ||
      variety.includes(query)
    );
  });
}
