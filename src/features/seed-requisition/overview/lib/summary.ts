import type {
  SeedRequisition,
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

function addQuantity(bucket: RequisitionQuantitySummary, requisition: SeedRequisition) {
  bucket.count += 1;
  if (requisition.requestedAcres != null && requisition.requestedAcres !== '') {
    const acres = Number(requisition.requestedAcres);
    if (Number.isFinite(acres)) bucket.acres += acres;
    return;
  }
  bucket.bags += requisition.requestedBags ?? 0;
}

export function summarizeRequisitions(requisitions: SeedRequisition[]): RequisitionOverviewSummary {
  const summary: RequisitionOverviewSummary = {
    total: emptyQuantity(),
    PENDING: emptyQuantity(),
    APPROVED: emptyQuantity(),
    REJECTED: emptyQuantity(),
  };

  for (const requisition of requisitions) {
    addQuantity(summary.total, requisition);
    addQuantity(summary[requisition.status], requisition);
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
