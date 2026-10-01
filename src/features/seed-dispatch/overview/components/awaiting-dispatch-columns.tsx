import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { parseDecimal } from '@/features/seed-dispatch/create/lib/quantity';
import type { DataTableFeatures } from '@/features/seed-dispatch/overview/components/data-table-features';
import {
  formatAwaitingQuantity,
  fulfillmentPercent,
  isAcresBasedSeedRequisition,
  remainingQuantity,
  toQuantityRequisition,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import {
  formatRequisitionDate,
  type SeedRequisition,
} from '@/features/seed-requisition/overview/types';

const columnHelper = createColumnHelper<DataTableFeatures, SeedRequisition>();

function formatDateFilterValue(value: unknown) {
  if (typeof value !== 'string' || !value) return 'Blank';
  return formatRequisitionDate(value);
}

export const awaitingColumns = columnHelper.columns([
  columnHelper.accessor((row) => row.farmer?.name ?? '', {
    id: 'farmer',
    header: 'Farmer',
    sortFn: 'text',
    meta: { filterLabel: 'Farmer' },
    cell: ({ row }) => (
      <div className="min-w-40 leading-snug">
        <p className="text-sm font-semibold">{row.original.farmer?.name || '—'}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {row.original.farmer?.accountNumber ? `#${row.original.farmer.accountNumber}` : '—'}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor((row) => row.variety?.name ?? '', {
    id: 'variety',
    header: 'Variety',
    sortFn: 'text',
    meta: { filterLabel: 'Variety' },
    cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span>,
  }),
  columnHelper.accessor((row) => row.approvedDeliveryDate ?? '', {
    id: 'approvedDeliveryDate',
    header: 'Approved delivery',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Approved delivery',
      filterValueFormatter: formatDateFilterValue,
    },
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {row.original.approvedDeliveryDate
          ? formatRequisitionDate(row.original.approvedDeliveryDate)
          : '—'}
      </span>
    ),
  }),
  columnHelper.accessor((row) => (isAcresBasedSeedRequisition(row) ? 'Acres' : 'Bags'), {
    id: 'basis',
    header: 'Basis',
    sortFn: 'text',
    meta: { filterLabel: 'Basis' },
    cell: ({ getValue }) => (
      <Badge variant="outline" className="bg-background font-normal">
        {getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor((row) => parseDecimal(row.requestedAcres), {
    id: 'acresOrdered',
    header: 'Acres ordered',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Acres ordered' },
    cell: ({ row }) => {
      const acres = parseDecimal(row.original.requestedAcres);
      if (!isAcresBasedSeedRequisition(row.original) || acres <= 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return <span className="tabular-nums">{formatAwaitingQuantity(acres)}</span>;
    },
  }),
  columnHelper.accessor((row) => row.requestedBags ?? 0, {
    id: 'seedBagsOrdered',
    header: 'Seed Bags ordered',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Seed Bags ordered' },
    cell: ({ row }) => {
      const bags = row.original.requestedBags ?? 0;
      if (isAcresBasedSeedRequisition(row.original) || bags <= 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return <span className="tabular-nums">{formatAwaitingQuantity(bags, 0)}</span>;
    },
  }),
  columnHelper.accessor((row) => row.remarks ?? '', {
    id: 'remarks',
    header: 'Remarks',
    sortFn: 'text',
    meta: { filterLabel: 'Remarks' },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.remarks?.trim() || '—'}</span>
    ),
  }),
  columnHelper.accessor(
    (row) => {
      const quantity = toQuantityRequisition(row);
      return parseDecimal(quantity.fulfilledAcres) + parseDecimal(quantity.fulfilledQuantity);
    },
    {
      id: 'dispatched',
      header: 'Dispatched',
      sortFn: 'alphanumeric',
      meta: { filterLabel: 'Dispatched' },
      cell: ({ row }) => {
        const quantity = toQuantityRequisition(row.original);
        return (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatAwaitingQuantity(parseDecimal(quantity.fulfilledAcres))} acres ·{' '}
            {formatAwaitingQuantity(parseDecimal(quantity.fulfilledQuantity), 0)} seed bags
          </span>
        );
      },
    },
  ),
  columnHelper.accessor((row) => remainingQuantity(row), {
    id: 'remaining',
    header: 'Remaining',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Remaining' },
    cell: ({ row }) => {
      const remaining = remainingQuantity(row.original);
      const label = isAcresBasedSeedRequisition(row.original)
        ? `${formatAwaitingQuantity(remaining)} acres`
        : `${formatAwaitingQuantity(remaining, 0)} seed bags`;
      return (
        <Badge variant="secondary" className="font-normal tabular-nums">
          {label}
        </Badge>
      );
    },
  }),
  columnHelper.accessor((row) => fulfillmentPercent(row), {
    id: 'fulfillment',
    header: 'Fulfillment',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Fulfillment' },
    cell: ({ row }) => {
      const percent = fulfillmentPercent(row.original);
      const isPartial = percent > 0 && percent < 100;
      return (
        <div className="flex w-full max-w-38 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="tabular-nums">{percent}%</span>
            {isPartial ? <span className="text-xs text-muted-foreground">Partial</span> : null}
          </div>
          <Progress value={percent} className="h-1.5" aria-label={`${percent}% fulfilled`} />
        </div>
      );
    },
  }),
]);
