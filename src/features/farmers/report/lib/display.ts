import type { FarmerReportRequisition } from '@/features/farmers/report/types';

export type QuantityKind = 'requested' | 'dispatched' | 'remaining';

export type QuantityLines = {
  primary: string | null;
  secondary: string | null;
};

export type ContractSummary = {
  requisitions: number;
  pending: number;
  acresRequested: number;
  acresDispatched: number;
  bagsDispatched: number;
};

export function parseQuantity(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Up to 3 decimal places, with trailing zeros removed. */
export function formatMeasure(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 1000) / 1000;
  if (Object.is(rounded, -0)) return '0';
  return String(rounded);
}

export function formatBags(value: number | null): string | null {
  if (value == null) return null;
  return `${formatMeasure(value)} bags`;
}

export function formatAcres(value: string | null): string | null {
  const parsed = parseQuantity(value);
  if (parsed == null) return null;
  return `${formatMeasure(parsed)} ac`;
}

function bagsFor(row: FarmerReportRequisition, kind: QuantityKind): number | null {
  if (kind === 'requested') return row.requestedBags;
  if (kind === 'dispatched') return row.dispatchedBags;
  return row.remainingBags;
}

function acresFor(row: FarmerReportRequisition, kind: QuantityKind): string | null {
  if (kind === 'requested') return row.requestedAcres;
  if (kind === 'dispatched') return row.dispatchedAcres;
  return row.remainingAcres;
}

export function quantityLines(row: FarmerReportRequisition, kind: QuantityKind): QuantityLines {
  const bags = formatBags(bagsFor(row, kind));
  const acres = formatAcres(acresFor(row, kind));
  if (row.quantityUnit === 'BAGS') {
    return { primary: bags, secondary: acres };
  }
  return { primary: acres, secondary: bags };
}

export function isNothingDispatched(row: FarmerReportRequisition): boolean {
  return row.dispatchedBags === 0 && (parseQuantity(row.dispatchedAcres) ?? 0) === 0;
}

export function isComplete(row: FarmerReportRequisition): boolean {
  if (row.quantityUnit === 'BAGS') return row.remainingBags === 0;
  return parseQuantity(row.remainingAcres) === 0;
}

export function dispatchPercent(row: FarmerReportRequisition): number {
  if (row.quantityUnit === 'ACRES') {
    const requested = parseQuantity(row.requestedAcres);
    const dispatched = parseQuantity(row.dispatchedAcres) ?? 0;
    if (!requested) return 0;
    return clampPercent((dispatched / requested) * 100);
  }

  if (!row.requestedBags) return 0;
  return clampPercent((row.dispatchedBags / row.requestedBags) * 100);
}

export function formatDispatchPercent(row: FarmerReportRequisition): string {
  return `${Math.round(dispatchPercent(row))}% dispatched`;
}

export type GroupDispatch = {
  requestedAcres: number;
  dispatchedAcres: number;
  requestedBags: number;
  dispatchedBags: number;
  usesAcres: boolean;
  percent: number;
};

export function groupDispatch(rows: FarmerReportRequisition[]): GroupDispatch {
  let requestedAcres = 0;
  let dispatchedAcres = 0;
  let requestedBags = 0;
  let dispatchedBags = 0;

  for (const row of rows) {
    const requested = parseQuantity(row.requestedAcres);
    if (requested != null) requestedAcres += requested;
    const dispatched = parseQuantity(row.dispatchedAcres);
    if (dispatched != null) dispatchedAcres += dispatched;
    if (row.requestedBags != null) requestedBags += row.requestedBags;
    dispatchedBags += row.dispatchedBags;
  }

  const usesAcres = requestedAcres > 0;
  const percent = usesAcres
    ? clampPercent((dispatchedAcres / requestedAcres) * 100)
    : requestedBags > 0
      ? clampPercent((dispatchedBags / requestedBags) * 100)
      : 0;

  return {
    requestedAcres,
    dispatchedAcres,
    requestedBags,
    dispatchedBags,
    usesAcres,
    percent,
  };
}

export function groupQuantityLines(
  rows: FarmerReportRequisition[],
  kind: 'requested' | 'dispatched',
): QuantityLines {
  const totals = groupDispatch(rows);
  const acres = kind === 'requested' ? totals.requestedAcres : totals.dispatchedAcres;
  const bags = kind === 'requested' ? totals.requestedBags : totals.dispatchedBags;
  const acresLabel = totals.usesAcres || acres > 0 ? `${formatMeasure(acres)} ac` : null;
  const bagsLabel = bags > 0 ? `${formatMeasure(bags)} bags` : null;
  const joiner = kind === 'dispatched' ? 'or' : 'and';

  if (totals.usesAcres) {
    return {
      primary: acresLabel,
      secondary: bagsLabel ? `${joiner} ${bagsLabel}` : null,
    };
  }
  return { primary: bagsLabel ?? '0 bags', secondary: null };
}

export function formatGroupDispatchPercent(rows: FarmerReportRequisition[]): string {
  return `${Math.round(groupDispatch(rows).percent)}% dispatched`;
}

export function summarizeContract(rows: FarmerReportRequisition[]): ContractSummary {
  let acresRequested = 0;
  let acresDispatched = 0;
  let bagsDispatched = 0;
  let pending = 0;

  for (const row of rows) {
    if (row.status === 'PENDING') pending += 1;
    const requested = parseQuantity(row.requestedAcres);
    if (requested != null) acresRequested += requested;
    const dispatched = parseQuantity(row.dispatchedAcres);
    if (dispatched != null) acresDispatched += dispatched;
    bagsDispatched += row.dispatchedBags;
  }

  return {
    requisitions: rows.length,
    pending,
    acresRequested,
    acresDispatched,
    bagsDispatched,
  };
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
