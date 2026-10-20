import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { DataTableFeatures } from '@/features/seed-dispatch/overview/components/data-table-features';
import {
  type AwaitingDeliveryLot,
  formatAwaitingQuantity,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import { formatRequisitionDate } from '@/features/seed-requisition/overview/types';

const columnHelper = createColumnHelper<DataTableFeatures, AwaitingDeliveryLot>();

function formatDateFilterValue(value: unknown) {
  if (typeof value !== 'string' || !value) return 'Blank';
  return formatRequisitionDate(value);
}

function quantityLabel(lot: AwaitingDeliveryLot, value: number) {
  return lot.isAcresBased
    ? `${formatAwaitingQuantity(value)} acres`
    : `${formatAwaitingQuantity(value, 0)} seed bags`;
}

export const awaitingColumns = columnHelper.columns([
  columnHelper.accessor((row) => row.farmerName, {
    id: 'farmer',
    header: 'Farmer',
    sortFn: 'text',
    meta: { filterLabel: 'Farmer' },
    cell: ({ row }) => (
      <div className="min-w-40 leading-snug">
        <p className="text-sm font-semibold">{row.original.farmerName || '—'}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {row.original.accountNumber ? `#${row.original.accountNumber}` : '—'}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor((row) => row.varietyName, {
    id: 'variety',
    header: 'Variety',
    sortFn: 'text',
    meta: { filterLabel: 'Variety' },
    cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span>,
  }),
  columnHelper.accessor((row) => row.deliveryDate, {
    id: 'approvedDeliveryDate',
    header: 'Approved delivery',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Approved delivery',
      filterValueFormatter: formatDateFilterValue,
    },
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatRequisitionDate(row.original.deliveryDate)}
      </span>
    ),
  }),
  columnHelper.accessor((row) => (row.isAcresBased ? 'Acres' : 'Bags'), {
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
  columnHelper.accessor((row) => (row.isAcresBased ? row.approvedQuantity : 0), {
    id: 'acresOrdered',
    header: 'Acres ordered',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Acres ordered' },
    cell: ({ row }) => {
      if (!row.original.isAcresBased) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <span className="tabular-nums">
          {formatAwaitingQuantity(row.original.approvedQuantity)}
        </span>
      );
    },
  }),
  columnHelper.accessor((row) => (row.isAcresBased ? 0 : row.approvedQuantity), {
    id: 'seedBagsOrdered',
    header: 'Seed Bags ordered',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Seed Bags ordered' },
    cell: ({ row }) => {
      if (row.original.isAcresBased) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <span className="tabular-nums">
          {formatAwaitingQuantity(row.original.approvedQuantity, 0)}
        </span>
      );
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
  columnHelper.accessor((row) => row.dispatchedQuantity, {
    id: 'dispatched',
    header: 'Dispatched',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Dispatched' },
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm tabular-nums">
        {quantityLabel(row.original, row.original.dispatchedQuantity)}
      </span>
    ),
  }),
  columnHelper.accessor((row) => row.remainingQuantity, {
    id: 'remaining',
    header: 'Remaining',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Remaining' },
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal tabular-nums">
        {row.original.remainingQuantity <= 0
          ? 'Fulfilled'
          : quantityLabel(row.original, row.original.remainingQuantity)}
      </Badge>
    ),
  }),
  columnHelper.accessor((row) => row.fulfillmentPercent, {
    id: 'fulfillment',
    header: 'Fulfillment',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Fulfillment' },
    cell: ({ row }) => {
      const percent = row.original.fulfillmentPercent;
      const fulfillmentLabel = percent >= 100 ? 'Fulfilled' : percent > 0 ? 'Partial' : null;
      return (
        <div className="flex w-full max-w-38 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="tabular-nums">{percent}%</span>
            {fulfillmentLabel ? (
              <span className="text-xs text-muted-foreground">{fulfillmentLabel}</span>
            ) : null}
          </div>
          <Progress value={percent} className="h-1.5" aria-label={`${percent}% fulfilled`} />
        </div>
      );
    },
  }),
]);
