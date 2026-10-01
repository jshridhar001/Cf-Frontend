import type { CellContext, ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { parseDecimal } from '@/features/seed-dispatch/lib/quantity';
import type { DispatchableRequisition } from '@/features/seed-dispatch/types';
import { RemarksPill } from '@/features/seed-requisition/components/remarks-pill';
import { formatDate } from '@/lib/format-date';

function formatDateFilterValue(value: unknown): string {
  if (value == null || value === '') return 'Blank';
  const formatted = formatDate(value as string);
  return formatted === '—' ? 'Blank' : formatted;
}

function dateCell({ getValue }: CellContext<DispatchableRequisition, unknown>) {
  const value = getValue();
  if (value == null || value === '') {
    return <span className="text-muted-foreground block w-full text-center text-sm">—</span>;
  }
  return (
    <span className="block w-full text-center whitespace-nowrap">
      {formatDate(value as string)}
    </span>
  );
}

function formatQty(value: number, fractionDigits = 2) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function fulfillmentPercent(row: DispatchableRequisition): number {
  if (row.isAcresBased) {
    const initial = parseDecimal(row.acres);
    if (initial <= 0) return 0;
    return Math.min(100, Math.round((parseDecimal(row.fulfilledAcres) / initial) * 100));
  }
  const initial = parseDecimal(row.seedBagsInitialQuantity);
  if (initial <= 0) return 0;
  return Math.min(100, Math.round((parseDecimal(row.fulfilledQuantity) / initial) * 100));
}

function FulfillmentCell({ row }: { row: DispatchableRequisition }) {
  const percent = fulfillmentPercent(row);
  const isPartial = percent > 0 && percent < 100;

  return (
    <div className="mx-auto flex w-full max-w-38 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="tabular-nums">{percent}%</span>
        {isPartial ? <span className="text-muted-foreground text-xs">Partial</span> : null}
      </div>
      <Progress value={percent} className="gap-0" aria-label={`${percent}% fulfilled`} />
    </div>
  );
}

export function createAwaitingColumns(): ColumnDef<DispatchableRequisition>[] {
  return [
    {
      id: 'farmer',
      accessorFn: (row) => row.farmer.name,
      header: 'Farmer',
      meta: { filterLabel: 'Farmer', wrap: true },
      cell: ({ row }) => (
        <div className="w-full min-w-40 text-left leading-snug">
          <p className="text-foreground text-sm font-semibold uppercase">
            {row.original.farmer.name}
          </p>
          <p className="text-muted-foreground text-xs tabular-nums">
            #{row.original.farmer.accountNumber}
          </p>
        </div>
      ),
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'variety',
      accessorFn: (row) => row.variety.name,
      header: 'Variety',
      meta: { filterLabel: 'Variety' },
      cell: ({ getValue }) => (
        <span className="block w-full text-center text-sm">{getValue<string>()}</span>
      ),
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      accessorKey: 'approvedDeliveryDate',
      header: 'Approved delivery',
      meta: {
        filterLabel: 'Approved delivery',
        filterValueFormatter: formatDateFilterValue,
      },
      cell: dateCell,
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'basis',
      accessorFn: (row) => (row.isAcresBased ? 'Acres' : 'Bags'),
      header: 'Basis',
      meta: { filterLabel: 'Basis' },
      cell: ({ getValue }) => (
        <div className="flex w-full justify-center">
          <Badge variant="outline" className="bg-background font-normal">
            {getValue<string>()}
          </Badge>
        </div>
      ),
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'acresOrdered',
      accessorFn: (row) => parseDecimal(row.acres),
      header: 'Acres ordered',
      meta: { numeric: true, filterLabel: 'Acres ordered' },
      cell: ({ row }) => {
        const acres = parseDecimal(row.original.acres);
        if (!row.original.isAcresBased || acres <= 0) {
          return <span className="text-muted-foreground block w-full text-center text-sm">—</span>;
        }
        return <span className="block w-full text-center tabular-nums">{formatQty(acres)}</span>;
      },
      sortingFn: 'basic',
      sortUndefined: 'last',
    },
    {
      id: 'seedBagsOrdered',
      accessorFn: (row) => parseDecimal(row.seedBagsInitialQuantity),
      header: 'Seed Bags ordered',
      meta: { numeric: true, filterLabel: 'Seed Bags ordered' },
      cell: ({ row }) => {
        const bags = parseDecimal(row.original.seedBagsInitialQuantity);
        if (row.original.isAcresBased || bags <= 0) {
          return <span className="text-muted-foreground block w-full text-center text-sm">—</span>;
        }
        return <span className="block w-full text-center tabular-nums">{formatQty(bags, 0)}</span>;
      },
      sortingFn: 'basic',
      sortUndefined: 'last',
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      meta: { filterLabel: 'Remarks', wrap: true },
      cell: ({ getValue }) => {
        const remarks = getValue<string | null>();
        return (
          <div className="flex w-full justify-center">
            <RemarksPill remarks={remarks ?? ''} />
          </div>
        );
      },
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'dispatched',
      accessorFn: (row) => parseDecimal(row.fulfilledAcres) + parseDecimal(row.fulfilledQuantity),
      header: 'Dispatched',
      meta: { filterLabel: 'Dispatched' },
      cell: ({ row }) => {
        const acres = parseDecimal(row.original.fulfilledAcres);
        const bags = parseDecimal(row.original.fulfilledQuantity);
        return (
          <span className="block w-full text-center text-sm whitespace-nowrap tabular-nums">
            {formatQty(acres)} acres · {formatQty(bags, 0)} seed bags
          </span>
        );
      },
      sortingFn: 'basic',
      sortUndefined: 'last',
    },
    {
      id: 'remaining',
      accessorFn: (row) => parseDecimal(row.remainingQuantity),
      header: 'Remaining',
      meta: { filterLabel: 'Remaining' },
      cell: ({ row }) => {
        const remaining = parseDecimal(row.original.remainingQuantity);
        const label = row.original.isAcresBased
          ? `${formatQty(remaining)} acres`
          : `${formatQty(remaining, 0)} seed bags`;
        return (
          <div className="flex w-full justify-center">
            <Badge variant="secondary" className="font-normal tabular-nums">
              {label}
            </Badge>
          </div>
        );
      },
      sortingFn: 'basic',
      sortUndefined: 'last',
    },
    {
      id: 'fulfillment',
      accessorFn: (row) => fulfillmentPercent(row),
      header: 'Fulfillment',
      meta: { numeric: true, filterLabel: 'Fulfillment' },
      cell: ({ row }) => <FulfillmentCell row={row.original} />,
      sortingFn: 'basic',
      sortUndefined: 'last',
    },
  ];
}
