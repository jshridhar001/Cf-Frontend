import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';

export type FarmersReceived = {
  received: number;
  total: number;
  percent: number;
};

export type FacilitySummary = {
  name: string;
  bags: number;
};

export function getTotalBags(dispatch: SeedDispatch): number {
  return dispatch.dispatchRequisitions.reduce(
    (sum, requisition) =>
      sum + requisition.sizeLines.reduce((lineSum, line) => lineSum + line.bagQuantity, 0),
    0,
  );
}

export function getFarmersReceived(dispatch: SeedDispatch): FarmersReceived {
  const total = dispatch.dispatchRequisitions.length;
  const received = dispatch.dispatchRequisitions.filter(
    (requisition) => requisition.status === 'RECEIVED',
  ).length;
  const percent = total === 0 ? 0 : Math.round((received / total) * 100);
  return { received, total, percent };
}

export function getDeliveredOn(dispatch: SeedDispatch): string | null {
  let latest: string | null = null;
  for (const requisition of dispatch.dispatchRequisitions) {
    if (!requisition.receivedAt) continue;
    if (!latest || requisition.receivedAt > latest) {
      latest = requisition.receivedAt;
    }
  }
  return latest;
}

export function getFacilitySummary(dispatch: SeedDispatch): FacilitySummary {
  const bags = getTotalBags(dispatch);
  for (const requisition of dispatch.dispatchRequisitions) {
    for (const line of requisition.sizeLines) {
      const name = line.facilityName?.trim();
      if (name) {
        return { name, bags };
      }
    }
  }
  return { name: '—', bags };
}
