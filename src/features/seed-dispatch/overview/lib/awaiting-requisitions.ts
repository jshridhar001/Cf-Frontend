import { acresFromBags, parseDecimal, round2 } from '@/features/seed-dispatch/create/lib/quantity';
import type { DispatchQuantitySummary } from '@/features/seed-dispatch/overview/lib/summary';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';
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

export type DeliveryUsage = {
  bags: number;
  acres: number;
};

export type AwaitingDeliveryLot = {
  id: string;
  requisitionId: string;
  farmerName: string;
  accountNumber: string;
  varietyName: string;
  deliveryDate: string;
  remarks: string | null;
  isAcresBased: boolean;
  approvedQuantity: number;
  dispatchedQuantity: number;
  remainingQuantity: number;
  fulfillmentPercent: number;
};

type DispatchUsageSource = {
  status: string;
  dispatchRequisitions: Array<{
    deliveryId?: string | null;
    sizeLines: Array<{
      bagQuantity: number;
      size?: { seedBagsPerAcre: number | null } | null;
    }>;
  }>;
};

export function usageByDeliveryId(dispatches: DispatchUsageSource[]) {
  const usage = new Map<string, DeliveryUsage>();

  for (const dispatch of dispatches) {
    if (dispatch.status === 'NULL') continue;
    for (const stop of dispatch.dispatchRequisitions) {
      if (!stop.deliveryId) continue;
      const current = usage.get(stop.deliveryId) ?? { bags: 0, acres: 0 };
      for (const line of stop.sizeLines) {
        current.bags += line.bagQuantity;
        current.acres = round2(
          current.acres + acresFromBags(line.bagQuantity, line.size?.seedBagsPerAcre ?? 0),
        );
      }
      usage.set(stop.deliveryId, current);
    }
  }

  return usage;
}

function lotFulfillmentPercent(approved: number, dispatched: number) {
  if (approved <= 0) return 0;
  return Math.min(100, Math.round((dispatched / approved) * 100));
}

export function buildAwaitingLots(
  requisitions: SeedRequisition[],
  dispatches: SeedDispatch[],
): AwaitingDeliveryLot[] {
  const usage = usageByDeliveryId(dispatches);
  const lots: AwaitingDeliveryLot[] = [];

  for (const requisition of requisitions) {
    for (const delivery of requisition.requestedDeliveries) {
      if (delivery.status !== 'APPROVED' || !delivery.id) continue;

      const acres = parseDecimal(delivery.acres);
      const isAcresBased = acres > 0;
      const approvedQuantity = isAcresBased ? acres : (delivery.bags ?? 0);
      if (approvedQuantity <= 0) continue;

      const dispatched = usage.get(delivery.id) ?? { bags: 0, acres: 0 };
      const dispatchedQuantity = isAcresBased ? round2(dispatched.acres) : dispatched.bags;
      const remainingQuantity = isAcresBased
        ? Math.max(0, round2(approvedQuantity - dispatchedQuantity))
        : Math.max(0, approvedQuantity - dispatchedQuantity);
      if (remainingQuantity <= 0) continue;

      lots.push({
        id: delivery.id,
        requisitionId: requisition.id,
        farmerName: requisition.farmer?.name ?? '',
        accountNumber: requisition.farmer?.accountNumber
          ? String(requisition.farmer.accountNumber)
          : '',
        varietyName: requisition.variety?.name ?? '',
        deliveryDate: delivery.deliveryDate,
        remarks: requisition.remarks,
        isAcresBased,
        approvedQuantity,
        dispatchedQuantity,
        remainingQuantity,
        fulfillmentPercent: lotFulfillmentPercent(approvedQuantity, dispatchedQuantity),
      });
    }
  }

  return lots;
}

export function matchesAwaitingSearch(lot: AwaitingDeliveryLot, query: string) {
  const haystack = [lot.farmerName, lot.accountNumber, lot.varietyName, lot.remarks]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function summarizeAwaitingLots(lots: AwaitingDeliveryLot[]): DispatchQuantitySummary {
  const summary: DispatchQuantitySummary = { count: 0, acres: 0, bags: 0 };

  for (const lot of lots) {
    summary.count += 1;
    if (lot.isAcresBased) summary.acres += lot.remainingQuantity;
    else summary.bags += lot.remainingQuantity;
  }

  return summary;
}

export function formatCalendarDayLabel(day: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return day;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

const quantityFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const bagFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export function formatAwaitingQuantity(value: number, fractionDigits: 0 | 2 = 2) {
  return (fractionDigits === 0 ? bagFormatter : quantityFormatter).format(value);
}
