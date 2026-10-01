import { format, isValid } from 'date-fns';

import { round2 } from '@/features/seed-dispatch/lib/quantity';
import type {
  FacilityDispatch,
  SeedDispatch,
  SeedDispatchApi,
  SeedDispatchApiStatus,
  SeedDispatchStatus,
} from '@/features/seed-dispatch/types';

const STATUS_MAP: Record<SeedDispatchApiStatus, SeedDispatchStatus> = {
  IN_TRANSIT: 'delivering',
  DELIVERED: 'delivered',
  NULL: 'null',
};

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

function aggregateFacilities(
  dispatch: SeedDispatchApi,
  facilityNameById: Map<string, string>,
): FacilityDispatch[] {
  const totals = new Map<string, number>();

  for (const stop of dispatch.dispatchRequisitions ?? []) {
    for (const line of stop.sizeLines ?? []) {
      const current = totals.get(line.facilityId) ?? 0;
      totals.set(line.facilityId, round2(current + toNumber(line.bagQuantity)));
    }
  }

  return Array.from(totals.entries()).map(([facilityId, bags]) => ({
    facilityName: facilityNameById.get(facilityId) ?? facilityId,
    bags,
  }));
}

function totalBags(dispatch: SeedDispatchApi): number {
  return round2(
    (dispatch.dispatchRequisitions ?? []).reduce(
      (sum, stop) =>
        sum +
        (stop.sizeLines ?? []).reduce((lineSum, line) => lineSum + toNumber(line.bagQuantity), 0),
      0,
    ),
  );
}

export function mapSeedDispatchStatus(status: SeedDispatchApiStatus): SeedDispatchStatus {
  return STATUS_MAP[status];
}

export function mapSeedDispatchToRow(
  dispatch: SeedDispatchApi,
  facilityNameById: Map<string, string> = new Map(),
): SeedDispatch {
  const stops = dispatch.dispatchRequisitions ?? [];
  const farmersReceived = stops.filter(
    (stop) => Boolean(stop.receivedAt) || Boolean(stop.otpVerifiedAt),
  ).length;

  return {
    id: dispatch.id,
    status: mapSeedDispatchStatus(dispatch.status),
    farmersSelected: stops.length,
    farmersReceived,
    dispatchDate: isoToDateOnly(dispatch.dispatchDate),
    deliveredOn: dispatch.status === 'DELIVERED' ? isoToDateOnly(dispatch.updatedAt) : null,
    facilities: aggregateFacilities(dispatch, facilityNameById),
    destination: dispatch.toLocation ?? '',
    remarks: dispatch.remarks ?? '',
    netWeightKg: toNumber(dispatch.netWeight),
    truckNumber: dispatch.truckNumber ?? '',
    driverMobile: dispatch.driverMobile ?? '',
    acres: 0,
    seedBags: totalBags(dispatch),
  };
}
