import {
  getRemainingAcres,
  getRemainingBags,
  isAcresBasedRequisition,
  parseDecimal,
  type QuantityRequisition,
} from '@/features/seed-dispatch/create/lib/quantity';
import type { DispatchQuantitySummary } from '@/features/seed-dispatch/overview/lib/summary';
import type {
  SeedRequisition,
  SeedRequisitionDelivery,
} from '@/features/seed-requisition/overview/types';

export function localCalendarDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function deliveryCalendarDay(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function deliveryLineForDay(
  deliveries: SeedRequisitionDelivery[] | null | undefined,
  day: string,
) {
  return (
    deliveries?.find(
      (line) => line.status === 'APPROVED' && deliveryCalendarDay(line.deliveryDate) === day,
    ) ?? null
  );
}

export function deliveryLineForToday(
  deliveries: SeedRequisitionDelivery[] | null | undefined,
  now = new Date(),
) {
  return deliveryLineForDay(deliveries, localCalendarDay(now));
}

export function formatDueTodayQuantity(
  line: Pick<SeedRequisitionDelivery, 'acres' | 'bags'> | null,
) {
  if (!line) return '';
  if (line.bags != null) {
    const bags = line.bags;
    return `${formatAwaitingQuantity(bags, 0)} ${bags === 1 ? 'bag' : 'bags'}`;
  }
  if (line.acres != null && line.acres !== '') {
    const acres = parseDecimal(line.acres);
    return `${formatAwaitingQuantity(acres)} ${acres === 1 ? 'acre' : 'acres'}`;
  }
  return '';
}

export function isApprovedRequisition(requisition: SeedRequisition) {
  return requisition.requestedDeliveries.some((line) => line.status === 'APPROVED');
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
