import { format, isValid } from 'date-fns';

import { getLotReceiptProgress, maskMobileNumber } from '@/features/seed-dispatch/lib/lot-status';
import { mapSeedDispatchStatus } from '@/features/seed-dispatch/lib/map-seed-dispatch';
import { round2 } from '@/features/seed-dispatch/lib/quantity';
import type {
  FacilityDispatch,
  SeedDispatchApi,
  SeedDispatchDetail,
  SeedDispatchLot,
  SeedDispatchLotSizeLine,
  SeedDispatchLotStatus,
  SeedDispatchRequisitionApi,
} from '@/features/seed-dispatch/types';

function isoToDateOnly(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;

  const date = new Date(value);
  if (!isValid(date)) return null;

  return format(date, 'yyyy-MM-dd');
}

function toNumber(value: string | number | null | undefined): number {
  if (value == null || value === '') return 0;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapLotStatus(status: string): SeedDispatchLotStatus {
  return status === 'RECEIVED' ? 'RECEIVED' : 'PENDING';
}

function mapSizeLines(stop: SeedDispatchRequisitionApi): SeedDispatchLotSizeLine[] {
  return (stop.sizeLines ?? []).map((line) => ({
    facilityName: line.facility?.name ?? line.facilityId,
    generationName: line.generation?.name ?? line.generationId,
    sizeName: line.size?.name ?? line.sizeId,
    quantity: toNumber(line.bagQuantity),
  }));
}

function mapLot(stop: SeedDispatchRequisitionApi): SeedDispatchLot {
  const sizeLines = mapSizeLines(stop);
  const bagTotal = round2(sizeLines.reduce((sum, line) => sum + line.quantity, 0));
  const mobile = stop.requisition?.farmer?.mobileNumber?.trim() ?? '';

  return {
    id: stop.id,
    status: mapLotStatus(stop.status),
    farmerName: stop.requisition?.farmer?.name ?? '—',
    farmerAccountNumber: stop.requisition?.farmer?.accountNumber ?? '—',
    mobileNumber: mobile || '—',
    mobileMasked: maskMobileNumber(mobile),
    varietyName: stop.requisition?.variety?.name ?? '—',
    bagTotal,
    sizeLines,
    otpSentAt: stop.otpSentAt,
    receivedAt: stop.receivedAt,
  };
}

export function mapSeedDispatchToDetail(dispatch: SeedDispatchApi): SeedDispatchDetail {
  const lots = (dispatch.dispatchRequisitions ?? []).map(mapLot);
  const progress = getLotReceiptProgress(lots);

  const facilityTotals = new Map<string, number>();
  let seedBags = 0;
  for (const lot of lots) {
    seedBags = round2(seedBags + lot.bagTotal);
    for (const line of lot.sizeLines) {
      facilityTotals.set(
        line.facilityName,
        round2((facilityTotals.get(line.facilityName) ?? 0) + line.quantity),
      );
    }
  }

  const facilities: FacilityDispatch[] = Array.from(facilityTotals.entries())
    .map(([facilityName, bags]) => ({ facilityName, bags }))
    .sort((a, b) => a.facilityName.localeCompare(b.facilityName));

  const netWeightKg = nullableNumber(dispatch.netWeight);
  const averageWeightPerBag =
    netWeightKg != null && seedBags > 0 ? round2(netWeightKg / seedBags) : null;

  const latestReceivedAt = lots
    .map((lot) => lot.receivedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return {
    id: dispatch.id,
    status: mapSeedDispatchStatus(dispatch.status),
    dispatchDate: isoToDateOnly(dispatch.dispatchDate),
    deliveredOn:
      dispatch.status === 'DELIVERED'
        ? isoToDateOnly(latestReceivedAt ?? dispatch.updatedAt)
        : null,
    destination: dispatch.toLocation ?? '',
    truckNumber: dispatch.truckNumber ?? '',
    manualGatePassNumber: dispatch.manualGatePassNumber,
    weightSlipNumber: dispatch.weightSlipNumber,
    driverMobile: dispatch.driverMobile ?? '',
    grossWeight: nullableNumber(dispatch.grossWeight),
    tareWeight: nullableNumber(dispatch.tareWeight),
    netWeightKg,
    averageWeightPerBag,
    remarks: dispatch.remarks,
    facilities,
    seedBags,
    progress,
    lots,
  };
}
