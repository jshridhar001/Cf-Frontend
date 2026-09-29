import { createColumnHelper } from '@tanstack/react-table';
import { EyeIcon, MoreHorizontalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import type { DataTableFeatures } from '@/features/seed-dispatch/overview/components/data-table-features';
import {
  getDeliveredOn,
  getFacilitySummary,
  getFarmersReceived,
} from '@/features/seed-dispatch/overview/lib/derived';
import { formatSummaryCount } from '@/features/seed-dispatch/overview/lib/summary';
import {
  formatDispatchDate,
  formatNetWeight,
  formatSeedDispatchStatus,
  type SeedDispatch,
} from '@/features/seed-dispatch/overview/types';

export type DispatchesTableMeta = {
  onView?: (dispatch: SeedDispatch) => void;
};

function statusBadgeClass(status: SeedDispatch['status']) {
  if (status === 'DELIVERED') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
  if (status === 'IN_TRANSIT') {
    return 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-400';
  }
  return 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400';
}

function DispatchRowActions({ dispatch }: { dispatch: SeedDispatch }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 min-h-11 min-w-11 md:min-h-8 md:min-w-8"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel className="font-semibold tracking-wide text-muted-foreground uppercase">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            toast.message('Dispatch details coming soon', {
              description: dispatch.toLocation,
            });
          }}
        >
          <EyeIcon />
          View details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columnHelper = createColumnHelper<DataTableFeatures, SeedDispatch>();

export const columns = columnHelper.columns([
  columnHelper.accessor('status', {
    header: 'Status',
    sortFn: 'text',
    meta: {
      filterLabel: 'Status',
      filterValueFormatter: (value) =>
        typeof value === 'string'
          ? formatSeedDispatchStatus(value as SeedDispatch['status'])
          : 'Blank',
    },
    cell: ({ row }) => (
      <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
        {formatSeedDispatchStatus(row.original.status)}
      </Badge>
    ),
  }),
  columnHelper.accessor((row) => getFarmersReceived(row).received, {
    id: 'farmersReceived',
    header: 'Farmers Received',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Farmers Received' },
    cell: ({ row }) => {
      const { received, total, percent } = getFarmersReceived(row.original);
      return (
        <div className="flex min-w-36 flex-col gap-1.5">
          <span className="text-sm tabular-nums">
            {received} / {total} farmers
          </span>
          <Progress value={percent} className="h-1.5" />
        </div>
      );
    },
  }),
  columnHelper.accessor((row) => row.dispatchDate ?? '', {
    id: 'dispatchDate',
    header: 'Dispatch Date',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Dispatch Date',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatDispatchDate(value) : 'Blank',
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDispatchDate(row.original.dispatchDate)}</span>
    ),
  }),
  columnHelper.accessor((row) => getDeliveredOn(row) ?? '', {
    id: 'deliveredOn',
    header: 'Delivered On',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Delivered On',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatDispatchDate(value) : 'Blank',
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDispatchDate(getDeliveredOn(row.original))}
      </span>
    ),
  }),
  columnHelper.accessor((row) => getFacilitySummary(row).name, {
    id: 'fromFacility',
    header: 'From Facility',
    sortFn: 'text',
    meta: { filterLabel: 'From Facility' },
    cell: ({ row }) => {
      const facility = getFacilitySummary(row.original);
      return (
        <div className="min-w-0">
          <p className="font-medium">{facility.name}</p>
          <p className="text-sm text-muted-foreground">
            · {formatSummaryCount(facility.bags)} bags
          </p>
        </div>
      );
    },
  }),
  columnHelper.accessor('toLocation', {
    id: 'destination',
    header: 'Destination',
    sortFn: 'text',
    meta: { filterLabel: 'Destination' },
  }),
  columnHelper.accessor((row) => row.remarks ?? '', {
    id: 'remarks',
    header: 'Remarks',
    sortFn: 'text',
    meta: {
      filterLabel: 'Remarks',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value.trim() ? value : 'Blank',
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.remarks?.trim() || '—'}</span>
    ),
  }),
  columnHelper.accessor((row) => Number(row.netWeight) || 0, {
    id: 'netWeight',
    header: 'Net Weight',
    sortFn: 'alphanumeric',
    aggregationFn: 'sum',
    meta: { filterLabel: 'Net Weight' },
    cell: ({ row }) => (
      <span className="tabular-nums">{formatNetWeight(row.original.netWeight)}</span>
    ),
  }),
  columnHelper.accessor((row) => row.truckNumber ?? '', {
    id: 'truckNumber',
    header: 'Truck Number',
    sortFn: 'text',
    meta: {
      filterLabel: 'Truck Number',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value.trim() ? value : 'Blank',
    },
    cell: ({ row }) => {
      const truck = row.original.truckNumber?.trim();
      if (!truck) return <span className="text-muted-foreground">—</span>;
      return (
        <button
          type="button"
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => toast.message('Truck details coming soon', { description: truck })}
        >
          {truck}
        </button>
      );
    },
  }),
  columnHelper.accessor((row) => row.driverMobile ?? '', {
    id: 'driverMobile',
    header: 'Driver Mobile Number',
    sortFn: 'text',
    meta: {
      filterLabel: 'Driver Mobile Number',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value.trim() ? value : 'Blank',
    },
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.original.driverMobile?.trim() || '—'}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DispatchRowActions dispatch={row.original} />
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    enableGrouping: false,
    enableHiding: false,
    enableGlobalFilter: false,
  }),
]);
