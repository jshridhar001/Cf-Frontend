import type { CellContext, ColumnDef, Table } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  type ColumnHeadings,
  DEFAULT_COLUMN_HEADINGS,
} from '@/features/seed-dispatch/lib/column-headings';
import type { SeedDispatch, SeedDispatchStatus } from '@/features/seed-dispatch/types';
import { RemarksPill } from '@/features/seed-requisition/components/remarks-pill';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

import { SeedDispatchRowActions } from './seed-dispatch-row-actions';

const STATUS_LABEL: Record<SeedDispatchStatus, string> = {
  delivering: 'In Transit',
  delivered: 'Delivered',
  null: 'Null',
};

function statusBadgeClassName(status: SeedDispatchStatus) {
  return cn(
    'border-transparent text-[11px] font-medium',
    status === 'delivered' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    status === 'delivering' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    status === 'null' && 'bg-muted text-muted-foreground',
  );
}

function UniqueCountCell({ value }: { value: unknown }) {
  return (
    <span className="text-muted-foreground block min-w-0 truncate text-sm">
      {Number(value ?? 0).toLocaleString('en-IN')} unique
    </span>
  );
}

function formatDateFilterValue(value: unknown): string {
  if (value == null || value === '') return 'Blank';
  const formatted = formatDate(value as string);
  return formatted === '—' ? 'Blank' : formatted;
}

function dateCell({ getValue }: CellContext<SeedDispatch, unknown>) {
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

function FarmersReceivedCell({ received, selected }: { received: number; selected: number }) {
  const percent = selected > 0 ? Math.round((received / selected) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-[9.5rem] flex-col gap-1.5">
      <span className="text-center text-sm tabular-nums">
        {received} / {selected} farmers
      </span>
      <Progress
        value={percent}
        className="gap-0"
        aria-label={`${received} of ${selected} farmers received`}
      />
    </div>
  );
}

function FacilitiesCell({ facilities }: { facilities: SeedDispatch['facilities'] }) {
  return (
    <div className="mx-auto w-full max-w-[14rem] space-y-1 text-center leading-snug break-words whitespace-normal">
      {facilities.map((facility) => (
        <div key={facility.facilityName} className="text-sm">
          <span className="font-medium">{facility.facilityName}</span>
          <span className="text-muted-foreground"> · {facility.bags} bags</span>
        </div>
      ))}
    </div>
  );
}

function formatWeight(kg: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(kg);
}

function weightCell({ getValue }: CellContext<SeedDispatch, unknown>) {
  const value = getValue();
  if (value == null || value === '') {
    return <span className="text-muted-foreground block w-full text-center text-sm">—</span>;
  }
  return (
    <span className="block w-full text-center tabular-nums">
      {formatWeight(value as number)} kg
    </span>
  );
}

function TotalLabel() {
  return (
    <span className="text-foreground block w-full text-center text-sm font-semibold">Total</span>
  );
}

function NetWeightTotalFooter({ table }: { table: Table<SeedDispatch> }) {
  const leafRows = table
    .getFilteredRowModel()
    .flatRows.filter((row) => !row.getIsGrouped() && row.original.status !== 'null');
  if (leafRows.length === 0) return null;

  const total = leafRows.reduce((sum, row) => sum + (row.original.netWeightKg ?? 0), 0);

  return (
    <span className="text-foreground block w-full text-center font-semibold tabular-nums">
      {formatWeight(total)} kg
    </span>
  );
}

type CreateColumnsOptions = {
  headings?: ColumnHeadings;
  onView?: (dispatch: SeedDispatch) => void;
  onMarkAsNull?: (id: string) => void | Promise<void>;
  onMarkInTransit?: (id: string) => void | Promise<void>;
};

export function createColumns({
  headings = DEFAULT_COLUMN_HEADINGS,
  onView,
  onMarkAsNull,
  onMarkInTransit,
}: CreateColumnsOptions = {}): ColumnDef<SeedDispatch>[] {
  return [
    {
      id: 'status',
      accessorKey: 'status',
      header: headings.status,
      meta: {
        filterLabel: headings.status,
        filterValueFormatter: (value) =>
          STATUS_LABEL[value as SeedDispatchStatus] ?? String(value ?? ''),
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => {
        const status = getValue<SeedDispatchStatus>();
        return (
          <div className="flex justify-center">
            <Badge variant="outline" className={statusBadgeClassName(status)}>
              {STATUS_LABEL[status]}
            </Badge>
          </div>
        );
      },
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'farmersReceived',
      accessorFn: (row) => `${row.farmersReceived}/${row.farmersSelected}`,
      header: headings.farmersReceived,
      footer: TotalLabel,
      meta: { filterLabel: headings.farmersReceived },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ row }) => (
        <FarmersReceivedCell
          received={row.original.farmersReceived}
          selected={row.original.farmersSelected}
        />
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.farmersReceived / Math.max(rowA.original.farmersSelected, 1);
        const b = rowB.original.farmersReceived / Math.max(rowB.original.farmersSelected, 1);
        return a - b;
      },
      sortUndefined: 'last',
    },
    {
      id: 'dispatchDate',
      accessorKey: 'dispatchDate',
      header: headings.dispatchDate,
      meta: {
        filterLabel: headings.dispatchDate,
        filterValueFormatter: formatDateFilterValue,
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: dateCell,
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'deliveredOn',
      accessorKey: 'deliveredOn',
      header: headings.deliveredOn,
      meta: {
        filterLabel: headings.deliveredOn,
        filterValueFormatter: formatDateFilterValue,
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: dateCell,
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'fromFacility',
      accessorFn: (row) => row.facilities.map((f) => f.facilityName).join(', '),
      header: headings.fromFacility,
      meta: { filterLabel: headings.fromFacility, wrap: true },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ row }) => <FacilitiesCell facilities={row.original.facilities} />,
      enableSorting: false,
    },
    {
      id: 'destination',
      accessorKey: 'destination',
      header: headings.destination,
      meta: { filterLabel: headings.destination, wrap: true },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => (
        <span className="block w-full text-center leading-snug break-words whitespace-normal">
          {getValue<string>()}
        </span>
      ),
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'remarks',
      accessorKey: 'remarks',
      header: headings.remarks,
      meta: { wrap: true, filterLabel: headings.remarks },
      enableGrouping: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const remarks = row.getValue('remarks') as string;
        return (
          <div className="flex w-full justify-center">
            <RemarksPill remarks={remarks} label={headings.remarks} />
          </div>
        );
      },
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'netWeightKg',
      accessorKey: 'netWeightKg',
      header: headings.netWeightKg,
      footer: NetWeightTotalFooter,
      meta: {
        numeric: true,
        filterLabel: headings.netWeightKg,
      },
      enableGrouping: false,
      cell: weightCell,
      sortingFn: 'basic',
      sortUndefined: 'last',
    },
    {
      id: 'truckNumber',
      accessorKey: 'truckNumber',
      header: headings.truckNumber,
      meta: { mono: true, filterLabel: headings.truckNumber },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ row }) => (
        <button
          type="button"
          className={cn(
            'block w-full cursor-pointer text-center font-mono text-sm underline-offset-4 hover:underline',
            row.original.status === 'null' ? 'text-muted-foreground' : 'text-primary',
          )}
          onClick={() => onView?.(row.original)}
        >
          {row.original.truckNumber}
        </button>
      ),
      sortingFn: 'text',
      sortUndefined: 'last',
    },
    {
      id: 'driverMobile',
      accessorKey: 'driverMobile',
      header: headings.driverMobile,
      meta: { filterLabel: headings.driverMobile },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => (
        <span className="block w-full text-center tabular-nums">{getValue<string>()}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      enableGrouping: false,
      enableColumnFilter: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <SeedDispatchRowActions
            dispatch={row.original}
            onView={onView}
            onMarkAsNull={onMarkAsNull}
            onMarkInTransit={onMarkInTransit}
          />
        </div>
      ),
    },
  ];
}
