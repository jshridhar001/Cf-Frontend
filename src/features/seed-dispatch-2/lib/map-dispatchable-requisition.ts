import {
  formatDecimal,
  getRemainingAcres,
  getRemainingBags,
  isAcresBasedRequisition,
  parseDecimal,
  round2,
} from '@/features/seed-dispatch/lib/quantity';
import type { DispatchableRequisition } from '@/features/seed-dispatch/types';
import type { SeedRequisition } from '@/features/seed-requisition/types';

function isoToDateOnly(value: string | null | undefined): string {
  if (!value?.trim()) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toQuantityString(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0';
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return '0';
  return formatDecimal(parsed);
}

export function mapSeedRequisitionToDispatchable(
  requisition: SeedRequisition,
): DispatchableRequisition | null {
  if (requisition.status !== 'APPROVED') return null;

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
  const remaining = isAcresBased ? getRemainingAcres(quantityRow) : getRemainingBags(quantityRow);

  if (remaining <= 0) return null;

  const initialQuantity = isAcresBased ? acres : seedBagsInitialQuantity;
  const accountNumber = Number.parseInt(requisition.farmer?.accountNumber ?? '', 10);

  return {
    id: requisition.id,
    farmer: {
      name: requisition.farmer?.name ?? '',
      accountNumber: Number.isFinite(accountNumber) ? accountNumber : 0,
    },
    variety: {
      name: requisition.variety?.name ?? '',
    },
    acres,
    seedBagsInitialQuantity,
    fulfilledQuantity: quantityRow.fulfilledQuantity,
    fulfilledAcres: quantityRow.fulfilledAcres,
    remarks: requisition.remarks,
    requisitionDate: isoToDateOnly(requisition.requisitionDate),
    approvedDeliveryDate: isoToDateOnly(requisition.approvedDeliveryDate) || null,
    remainingQuantity: formatDecimal(remaining),
    initialQuantity,
    isAcresBased,
  };
}

export function hasRemainingDispatchQuantity(requisition: SeedRequisition): boolean {
  if (requisition.status !== 'APPROVED') return false;

  const requestedBags = Number(requisition.requestedBags) || 0;
  const fulfilledBags = Number(requisition.fulfilledBags) || 0;
  const requestedAcres = parseDecimal(requisition.requestedAcres);
  const fulfilledAcres = parseDecimal(requisition.fulfilledAcres);

  if (requestedAcres > 0) {
    return round2(requestedAcres - fulfilledAcres) > 0;
  }

  return requestedBags > fulfilledBags;
}
