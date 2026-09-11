import { CheckCircle2, Eye, MoreHorizontal, XCircle } from 'lucide-react';
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
import type { ColumnHeadings } from '@/features/seed-requisition/report/lib/column-headings';
import type { ColumnDef } from '@/features/seed-requisition/report/lib/react-table';
import type {
  SeedRequisitionRow,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/report/types';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

import { RemarksPill } from './remarks-pill';

const STATUS_LABEL: Record<SeedRequisitionStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
};

function statusBadgeClassName(status: SeedRequisitionStatus) {
  return cn(
    'border-transparent text-[11px] font-medium',
    status === 'approved' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    status === 'pending' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    status === 'rejected' && 'bg-destructive/10 text-destructive',
  );
}

function UniqueCountCell({ value }: { value: unknown }) {
  return (
    <span className="block min-w-0 truncate text-sm text-muted-foreground">
      {Number(value ?? 0).toLocaleString('en-IN')} unique
    </span>
  );
}

type ColumnHandlers = {
  onView: (requisition: SeedRequisitionRow) => void;
  onApprove: (requisition: SeedRequisitionRow) => void;
  onReject: (requisition: SeedRequisitionRow) => void;
};

export function createColumns(
  headings: ColumnHeadings,
  { onView, onApprove, onReject }: ColumnHandlers,
): ColumnDef<SeedRequisitionRow>[] {
  return [
    {
      id: 'requisitionDate',
      accessorKey: 'requisitionDate',
      header: headings.requisitionDate,
      meta: {
        width: '11%',
        filterLabel: headings.requisitionDate,
        filterValueFormatter: (value: unknown) => formatDate(String(value ?? '')),
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      id: 'farmer',
      accessorKey: 'farmer',
      header: headings.farmer,
      meta: {
        width: '14%',
        filterLabel: headings.farmer,
        cellClassName: 'whitespace-normal',
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => (
        <span className="block min-w-0 font-medium leading-snug break-words whitespace-normal text-primary">
          {getValue<string>()}
        </span>
      ),
    },
    {
      id: 'variety',
      accessorKey: 'variety',
      header: headings.variety,
      meta: { width: '12%', filterLabel: headings.variety },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => getValue<string>(),
    },
    {
      id: 'acres',
      accessorKey: 'acres',
      header: headings.acres,
      meta: { width: '8%', filterLabel: headings.acres },
      enableGrouping: false,
      aggregationFn: 'sum',
      aggregatedCell: ({ getValue }) => (
        <span className="block min-w-0 truncate text-sm font-medium tabular-nums text-foreground">
          {Number(getValue() ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      ),
      cell: ({ getValue }) => (
        <span className="tabular-nums">
          {Number(getValue() ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: 'seedBags',
      accessorKey: 'seedBags',
      header: headings.seedBags,
      meta: { width: '9%', filterLabel: headings.seedBags },
      enableGrouping: false,
      aggregationFn: 'sum',
      aggregatedCell: ({ getValue }) => (
        <span className="block min-w-0 truncate text-sm font-medium tabular-nums text-foreground">
          {Number(getValue() ?? 0).toLocaleString('en-IN')}
        </span>
      ),
      cell: ({ getValue }) => (
        <span className="tabular-nums">{Number(getValue() ?? 0).toLocaleString('en-IN')}</span>
      ),
    },
    {
      id: 'requestedDeliveryDate',
      accessorKey: 'requestedDeliveryDate',
      header: headings.requestedDeliveryDate,
      meta: {
        width: '11%',
        filterLabel: headings.requestedDeliveryDate,
        filterValueFormatter: (value: unknown) => formatDate(String(value ?? '')),
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      id: 'approvedDelivery',
      accessorKey: 'approvedDelivery',
      header: headings.approvedDelivery,
      meta: {
        width: '11%',
        filterLabel: headings.approvedDelivery,
        filterValueFormatter: (value: unknown) => formatDate(String(value ?? '')),
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      id: 'rejectionDate',
      accessorKey: 'rejectionDate',
      header: headings.rejectionDate,
      meta: {
        width: '11%',
        filterLabel: headings.rejectionDate,
        filterValueFormatter: (value: unknown) => formatDate(String(value ?? '')),
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: headings.status,
      meta: {
        width: '9%',
        filterLabel: headings.status,
        filterValueFormatter: (value: unknown) =>
          STATUS_LABEL[value as SeedRequisitionStatus] ?? String(value),
      },
      enableGrouping: true,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }) => <UniqueCountCell value={getValue()} />,
      cell: ({ getValue }) => {
        const status = getValue<SeedRequisitionStatus>();
        return (
          <Badge variant="outline" className={statusBadgeClassName(status)}>
            {STATUS_LABEL[status]}
          </Badge>
        );
      },
    },
    {
      id: 'remarks',
      accessorKey: 'remarks',
      header: headings.remarks,
      meta: {
        width: '12%',
        filterLabel: headings.remarks,
        cellClassName: 'whitespace-normal',
      },
      enableGrouping: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const text =
          row.original.status === 'rejected' && row.original.rejectionRemarks
            ? row.original.rejectionRemarks
            : row.original.remarks;
        return text ? (
          <RemarksPill remarks={text} label={headings.remarks} />
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableGrouping: false,
      enableColumnFilter: false,
      enableHiding: false,
      meta: { width: '6%', filterLabel: 'Actions' },
      cell: ({ row }) => {
        const requisition = row.original;
        const isPending = requisition.status === 'pending';

        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${requisition.farmer}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(requisition)}>
                  <Eye className="size-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!isPending} onClick={() => onApprove(requisition)}>
                  <CheckCircle2 className="size-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!isPending}
                  variant="destructive"
                  onClick={() => onReject(requisition)}
                >
                  <XCircle className="size-4" />
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
