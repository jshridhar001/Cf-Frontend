import { parseDecimal, round2 } from '@/features/seed-dispatch/create/lib/quantity';
import {
  deliveryCalendarDay,
  formatAwaitingQuantity,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';
import { getRequisitionVillageName } from '@/features/seed-requisition/overview/types';

export type PendingDeliveryLine = {
  id: string;
  deliveryId: string | null;
  requisitionId: string;
  farmerName: string;
  accountNumber: string;
  villageName: string;
  varietyId: string;
  varietyName: string;
  deliveryDate: string;
  remarks: string | null;
  isAcresBased: boolean;
  bags: number;
  acres: number;
};

export type PendingDeliveryFilters = {
  query: string;
  date: string;
  varietyId: string;
  village: string;
};

export type PendingDateGroup = {
  date: string;
  lines: PendingDeliveryLine[];
  bags: number;
  acres: number;
};

export type PendingDeliverySummary = {
  count: number;
  bags: number;
  acres: number;
  dateCount: number;
};

export function buildPendingDeliveryLines(requisitions: SeedRequisition[]): PendingDeliveryLine[] {
  const lines: PendingDeliveryLine[] = [];

  for (const requisition of requisitions) {
    requisition.requestedDeliveries.forEach((delivery, index) => {
      if (delivery.status !== 'PENDING') return;

      const acres = parseDecimal(delivery.acres);
      const bags = delivery.bags ?? 0;
      const isAcresBased = acres > 0;
      if (isAcresBased ? acres <= 0 : bags <= 0) return;

      const deliveryDate = deliveryCalendarDay(delivery.deliveryDate);
      lines.push({
        id: delivery.id ?? `${requisition.id}:${deliveryDate}:${index}`,
        deliveryId: delivery.id ?? null,
        requisitionId: requisition.id,
        farmerName: requisition.farmer?.name ?? '',
        accountNumber: requisition.farmer?.accountNumber
          ? String(requisition.farmer.accountNumber)
          : '',
        villageName: getRequisitionVillageName(requisition.farmer),
        varietyId: requisition.varietyId,
        varietyName: requisition.variety?.name ?? '',
        deliveryDate,
        remarks: requisition.remarks,
        isAcresBased,
        bags: isAcresBased ? 0 : bags,
        acres: isAcresBased ? acres : 0,
      });
    });
  }

  return lines.sort(comparePendingLines);
}

export function filterPendingLines(lines: PendingDeliveryLine[], filters: PendingDeliveryFilters) {
  const query = filters.query.trim().toLowerCase();

  return lines.filter((line) => {
    if (filters.date && line.deliveryDate !== filters.date) return false;
    if (filters.varietyId && line.varietyId !== filters.varietyId) return false;
    if (filters.village && line.villageName !== filters.village) return false;
    if (!query) return true;

    const haystack = [
      line.farmerName,
      line.accountNumber,
      line.villageName,
      line.varietyName,
      line.remarks,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function sumPendingBags(lines: PendingDeliveryLine[]) {
  return lines.reduce((total, line) => total + line.bags, 0);
}

export function sumPendingAcres(lines: PendingDeliveryLine[]) {
  return round2(lines.reduce((total, line) => total + line.acres, 0));
}

export function summarizePendingLines(lines: PendingDeliveryLine[]): PendingDeliverySummary {
  return {
    count: lines.length,
    bags: sumPendingBags(lines),
    acres: sumPendingAcres(lines),
    dateCount: new Set(lines.map((line) => line.deliveryDate)).size,
  };
}

export function groupPendingDeliveriesByDate(lines: PendingDeliveryLine[]): PendingDateGroup[] {
  const grouped = new Map<string, PendingDeliveryLine[]>();

  for (const line of lines) {
    const current = grouped.get(line.deliveryDate) ?? [];
    current.push(line);
    grouped.set(line.deliveryDate, current);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, groupLines]) => {
      const sorted = [...groupLines].sort(comparePendingLines);
      return {
        date,
        lines: sorted,
        bags: sumPendingBags(sorted),
        acres: sumPendingAcres(sorted),
      };
    });
}

export function formatDateGroupSummary(group: Pick<PendingDateGroup, 'lines' | 'bags' | 'acres'>) {
  const count = group.lines.length;
  const parts = [`${count} ${count === 1 ? 'request' : 'requests'}`];
  if (group.bags > 0) {
    parts.push(`${formatAwaitingQuantity(group.bags, 0)} ${group.bags === 1 ? 'bag' : 'bags'}`);
  }
  if (group.acres > 0) {
    parts.push(`${formatAwaitingQuantity(group.acres)} ${group.acres === 1 ? 'acre' : 'acres'}`);
  }
  return parts.join(' · ');
}

export function formatPendingQuantity(
  line: Pick<PendingDeliveryLine, 'isAcresBased' | 'bags' | 'acres'>,
) {
  if (line.isAcresBased) {
    return `${formatAwaitingQuantity(line.acres)} ${line.acres === 1 ? 'acre' : 'acres'}`;
  }
  return `${formatAwaitingQuantity(line.bags, 0)} ${line.bags === 1 ? 'bag' : 'bags'}`;
}

function comparePendingLines(left: PendingDeliveryLine, right: PendingDeliveryLine) {
  const byDate = left.deliveryDate.localeCompare(right.deliveryDate);
  if (byDate !== 0) return byDate;
  const byFarmer = left.farmerName.localeCompare(right.farmerName, undefined, {
    sensitivity: 'base',
  });
  if (byFarmer !== 0) return byFarmer;
  return left.id.localeCompare(right.id);
}
