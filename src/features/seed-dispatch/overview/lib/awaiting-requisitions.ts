import {
  getRemainingAcres,
  getRemainingBags,
  isAcresBasedRequisition,
  parseDecimal,
  type QuantityRequisition,
} from '@/features/seed-dispatch/create/lib/quantity';
import type { DispatchQuantitySummary } from '@/features/seed-dispatch/overview/lib/summary';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';

export function isApprovedRequisition(requisition: SeedRequisition) {
  return requisition.status === 'APPROVED';
}

export function toQuantityRequisition(requisition: SeedRequisition): QuantityRequisition {
  return {
    acres: requisition.requestedAcres,
    seedBagsInitialQuantity:
      requisition.requestedBags != null ? String(requisition.requestedBags) : null,
    fulfilledQuantity: String(requisition.fulfilledBags),
    fulfilledAcres: requisition.fulfilledAcres,
  };
}

export function isAcresBasedSeedRequisition(requisition: SeedRequisition) {
  return isAcresBasedRequisition(toQuantityRequisition(requisition));
}

export function remainingQuantity(requisition: SeedRequisition) {
  const row = toQuantityRequisition(requisition);
  return isAcresBasedRequisition(row) ? getRemainingAcres(row) : getRemainingBags(row);
}

export function fulfillmentPercent(requisition: SeedRequisition) {
  const row = toQuantityRequisition(requisition);
  if (isAcresBasedRequisition(row)) {
    const initial = parseDecimal(row.acres);
    if (initial <= 0) return 0;
    return Math.min(100, Math.round((parseDecimal(row.fulfilledAcres) / initial) * 100));
  }

  const initial = parseDecimal(row.seedBagsInitialQuantity);
  if (initial <= 0) return 0;
  return Math.min(100, Math.round((parseDecimal(row.fulfilledQuantity) / initial) * 100));
}

export function matchesAwaitingSearch(requisition: SeedRequisition, query: string) {
  const haystack = [
    requisition.farmer?.name,
    requisition.farmer?.accountNumber,
    requisition.variety?.name,
    requisition.remarks,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function summarizeApprovedRequisitions(
  requisitions: SeedRequisition[],
): DispatchQuantitySummary {
  const summary: DispatchQuantitySummary = { count: 0, acres: 0, bags: 0 };

  for (const requisition of requisitions) {
    if (!isApprovedRequisition(requisition)) continue;
    summary.count += 1;
    summary.acres += parseDecimal(requisition.requestedAcres);
    summary.bags += requisition.requestedBags ?? 0;
  }

  return summary;
}

const quantityFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const bagFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export function formatAwaitingQuantity(value: number, fractionDigits: 0 | 2 = 2) {
  return (fractionDigits === 0 ? bagFormatter : quantityFormatter).format(value);
}
