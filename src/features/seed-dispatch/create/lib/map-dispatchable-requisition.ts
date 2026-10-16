import {
  formatDecimal,
  getRemainingAcres,
  getRemainingBags,
  isAcresBasedRequisition,
  parseDecimal,
  round2,
} from '@/features/seed-dispatch/create/lib/quantity';
import type { DispatchableRequisition } from '@/features/seed-dispatch/create/types';
import {
  deliveryCalendarDay,
  localCalendarDay,
  usageByDeliveryId,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';
import type { ApiSeedRequisition } from '@/features/seed-requisition/overview/types';

function toQuantityString(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0';
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return '0';
  return formatDecimal(parsed);
}

export function mapApprovedDeliveryLots(
  requisitions: ApiSeedRequisition[],
  dispatches: SeedDispatch[],
): DispatchableRequisition[] {
  const usage = usageByDeliveryId(dispatches);
  const today = localCalendarDay(new Date());
  const lots: DispatchableRequisition[] = [];

  for (const requisition of requisitions) {
    const acres =
      requisition.requestedAcres != null && String(requisition.requestedAcres).trim()
        ? String(requisition.requestedAcres)
        : null;
    const seedBagsInitialQuantity =
      requisition.requestedBags != null ? String(requisition.requestedBags) : null;
    const quantityRow = {
      acres,
      seedBagsInitialQuantity,
      fulfilledQuantity: toQuantityString(requisition.fulfilledBags),
      fulfilledAcres: toQuantityString(requisition.fulfilledAcres),
    };
    const isAcresBased = isAcresBasedRequisition(quantityRow);
    const requisitionRemaining = isAcresBased
      ? getRemainingAcres(quantityRow)
      : getRemainingBags(quantityRow);
    const accountNumber = Number.parseInt(requisition.farmer?.accountNumber ?? '', 10);

    for (const delivery of requisition.deliveries ?? []) {
      if (delivery.status !== 'APPROVED') continue;

      const approvedQuantity = isAcresBased ? parseDecimal(delivery.acres) : (delivery.bags ?? 0);
      if (approvedQuantity <= 0) continue;

      const dispatched = usage.get(delivery.id) ?? { bags: 0, acres: 0 };
      const dispatchedQuantity = isAcresBased ? round2(dispatched.acres) : dispatched.bags;
      const lotRemaining = isAcresBased
        ? Math.max(0, round2(approvedQuantity - dispatchedQuantity))
        : Math.max(0, approvedQuantity - dispatchedQuantity);
      const remaining = Math.min(lotRemaining, requisitionRemaining);
      if (remaining <= 0) continue;

      const deliveryDate = deliveryCalendarDay(delivery.deliveryDate);
      const isToday = deliveryDate === today;
      const fulfilledAgainstCap = Math.max(0, round2(approvedQuantity - remaining));

      lots.push({
        id: delivery.id,
        requisitionId: requisition.id,
        deliveryDate,
        farmer: {
          name: requisition.farmer?.name ?? '',
          accountNumber: Number.isFinite(accountNumber) ? accountNumber : 0,
        },
        varietyId: requisition.varietyId,
        variety: {
          name: requisition.variety?.name ?? '',
        },
        acres: isAcresBased ? formatDecimal(approvedQuantity) : null,
        seedBagsInitialQuantity: isAcresBased ? null : String(approvedQuantity),
        fulfilledQuantity: isAcresBased ? '0' : formatDecimal(fulfilledAgainstCap),
        fulfilledAcres: isAcresBased ? formatDecimal(fulfilledAgainstCap) : '0',
        remarks: requisition.remarks,
        requisitionDate: deliveryDate,
        dueTodayAcres: isToday && isAcresBased ? formatDecimal(remaining) : null,
        dueTodayBags: isToday && !isAcresBased ? remaining : null,
        remainingQuantity: isAcresBased ? formatDecimal(remaining) : String(remaining),
        initialQuantity: isAcresBased ? formatDecimal(approvedQuantity) : String(approvedQuantity),
        isAcresBased,
      });
    }
  }

  return lots;
}
