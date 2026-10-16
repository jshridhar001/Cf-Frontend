import { statusFromDeliveries } from '@/features/seed-requisition/overview/lib/requested-deliveries';
import type {
  SeedRequisition,
  SeedRequisitionDelivery,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

export type RequisitionQuantitySummary = {
  count: number;
  acres: number;
  bags: number;
};

export type RequisitionOverviewSummary = {
  total: RequisitionQuantitySummary;
} & Record<SeedRequisitionStatus, RequisitionQuantitySummary>;

function emptyQuantity(): RequisitionQuantitySummary {
  return { count: 0, acres: 0, bags: 0 };
}

function finiteNumber(value: string | number | null | undefined) {
  if (value == null || value === '') return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function addRequested(bucket: RequisitionQuantitySummary, requisition: SeedRequisition) {
  bucket.count += 1;
  bucket.acres += finiteNumber(requisition.requestedAcres);
  bucket.bags += finiteNumber(requisition.requestedBags);
}

function addDelivery(bucket: RequisitionQuantitySummary, delivery: SeedRequisitionDelivery) {
  bucket.acres += finiteNumber(delivery.acres);
  bucket.bags += finiteNumber(delivery.bags);
}

export function summarizeRequisitions(requisitions: SeedRequisition[]): RequisitionOverviewSummary {
  const summary: RequisitionOverviewSummary = {
    total: emptyQuantity(),
    PENDING: emptyQuantity(),
    APPROVED: emptyQuantity(),
    REJECTED: emptyQuantity(),
  };

  for (const requisition of requisitions) {
    addRequested(summary.total, requisition);
    const deliveries = requisition.requestedDeliveries;
    const status = statusFromDeliveries(deliveries);
    summary[status].count += 1;

    if (deliveries.length === 0) {
      summary[status].acres += finiteNumber(requisition.requestedAcres);
      summary[status].bags += finiteNumber(requisition.requestedBags);
      continue;
    }

    let scheduledAcres = 0;
    let scheduledBags = 0;
    for (const delivery of deliveries) {
      addDelivery(summary[delivery.status], delivery);
      scheduledAcres += finiteNumber(delivery.acres);
      scheduledBags += finiteNumber(delivery.bags);
    }

    summary.PENDING.acres += Math.max(0, finiteNumber(requisition.requestedAcres) - scheduledAcres);
    summary.PENDING.bags += Math.max(0, finiteNumber(requisition.requestedBags) - scheduledBags);
  }

  return summary;
}

const countFormatter = new Intl.NumberFormat('en-IN');
const acresFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

export function formatSummaryCount(value: number) {
  return countFormatter.format(value);
}

export function formatSummaryAcres(value: number) {
  return acresFormatter.format(value);
}
