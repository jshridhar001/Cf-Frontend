import { parseQuantity } from '@/features/farmers/report/lib/display';
import type { FarmerReportRequisition } from '@/features/farmers/report/types';

export type DispatchSortKey = 'name' | 'contractedAcres' | 'dispatchedAcres' | 'remainingAcres';

export type DispatchSort = {
  key: DispatchSortKey;
  desc: boolean;
};

export type DispatchRow = {
  key: string;
  name: string;
  contractedAcres: number;
  dispatchedAcres: number;
  remainingAcres: number;
  percent: number;
};

export type FamilyDispatchSummary = {
  rows: DispatchRow[];
  contractedAcres: number;
  dispatchedAcres: number;
  remainingAcres: number;
  percent: number;
};

type Bucket = {
  key: string;
  name: string;
  contracted: number;
  dispatched: number;
};

/** Up to 2 decimal places, with trailing zeros removed. */
export function formatDispatchAcres(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  if (Object.is(rounded, -0)) return '0';
  return String(rounded);
}

function roundAcres(value: number): number {
  return Number(formatDispatchAcres(value));
}

function sentPercent(contracted: number, dispatched: number): number {
  if (contracted <= 0) return 0;
  const value = (dispatched / contracted) * 100;
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function compareNames(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: 'base', numeric: true });
}

function toDispatchRow(bucket: Bucket): DispatchRow {
  const contractedAcres = roundAcres(bucket.contracted);
  const dispatchedAcres = roundAcres(bucket.dispatched);
  const remainingAcres = roundAcres(Math.max(0, contractedAcres - dispatchedAcres));
  return {
    key: bucket.key,
    name: bucket.name,
    contractedAcres,
    dispatchedAcres,
    remainingAcres,
    percent: sentPercent(contractedAcres, dispatchedAcres),
  };
}

export function sortDispatchRows(rows: DispatchRow[], sort: DispatchSort): DispatchRow[] {
  const direction = sort.desc ? -1 : 1;
  return [...rows].sort((left, right) => {
    if (sort.key === 'name') {
      return compareNames(left.name, right.name) * direction || left.key.localeCompare(right.key);
    }
    const diff = left[sort.key] - right[sort.key];
    if (diff !== 0) return diff * direction;
    return compareNames(left.name, right.name) || left.key.localeCompare(right.key);
  });
}

export function computeFamilyDispatch(
  requisitions: FarmerReportRequisition[],
): FamilyDispatchSummary {
  const buckets = new Map<string, Bucket>();

  for (const requisition of requisitions) {
    if (requisition.status === 'REJECTED') continue;

    const family = requisition.farmer.family;
    const key = family ? `family:${family.id}` : `farmer:${requisition.farmer.id}`;
    const name = (family?.name ?? requisition.farmer.name).trim() || requisition.farmer.name;
    const bucket = buckets.get(key) ?? { key, name, contracted: 0, dispatched: 0 };
    bucket.contracted += parseQuantity(requisition.requestedAcres) ?? 0;
    bucket.dispatched += parseQuantity(requisition.dispatchedAcres) ?? 0;
    buckets.set(key, bucket);
  }

  const rows = sortDispatchRows([...buckets.values()].map(toDispatchRow), {
    key: 'name',
    desc: false,
  });
  const contractedAcres = roundAcres(rows.reduce((sum, row) => sum + row.contractedAcres, 0));
  const dispatchedAcres = roundAcres(rows.reduce((sum, row) => sum + row.dispatchedAcres, 0));
  const remainingAcres = roundAcres(rows.reduce((sum, row) => sum + row.remainingAcres, 0));

  return {
    rows,
    contractedAcres,
    dispatchedAcres,
    remainingAcres,
    percent: sentPercent(contractedAcres, dispatchedAcres),
  };
}
