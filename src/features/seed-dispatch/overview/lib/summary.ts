import { getTotalBags } from '@/features/seed-dispatch/overview/lib/derived';
import type {
  SeedDispatch,
  SeedDispatchStatus,
} from '@/features/seed-dispatch/overview/types';

export type DispatchQuantitySummary = {
  count: number;
  acres: number;
  bags: number;
};

export type DispatchOverviewSummary = {
  total: DispatchQuantitySummary;
} & Record<SeedDispatchStatus, DispatchQuantitySummary>;

function emptyQuantity(): DispatchQuantitySummary {
  return { count: 0, acres: 0, bags: 0 };
}

function addQuantity(bucket: DispatchQuantitySummary, dispatch: SeedDispatch) {
  bucket.count += 1;
  bucket.bags += getTotalBags(dispatch);
  if (dispatch.acres != null && Number.isFinite(dispatch.acres)) {
    bucket.acres += dispatch.acres;
  }
}

export function summarizeDispatches(dispatches: SeedDispatch[]): DispatchOverviewSummary {
  const summary: DispatchOverviewSummary = {
    total: emptyQuantity(),
    IN_TRANSIT: emptyQuantity(),
    DELIVERED: emptyQuantity(),
    AWAITING_DISPATCH: emptyQuantity(),
  };

  for (const dispatch of dispatches) {
    addQuantity(summary.total, dispatch);
    addQuantity(summary[dispatch.status], dispatch);
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
