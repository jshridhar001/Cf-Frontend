import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  dispatchPercent,
  formatDispatchPercent,
  isComplete,
  isNothingDispatched,
  type QuantityKind,
  quantityLines,
} from '@/features/farmers/report/lib/display';
import type { ReportTableFeatures } from '@/features/farmers/report/lib/table-features';
import type { FarmerReportRequisition, FarmerReportStatus } from '@/features/farmers/report/types';
import {
  formatRequisitionDate,
  formatSeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

const columnHelper = createColumnHelper<ReportTableFeatures, FarmerReportRequisition>();

function formatContractDate(value: string | null) {
  if (!value) return '—';
  return formatRequisitionDate(value);
}

function statusBadgeClass(status: FarmerReportStatus) {
  if (status === 'APPROVED') return 'border-primary/25 bg-primary/10 text-primary';
  if (status === 'REJECTED') return 'border-destructive/25 bg-destructive/10 text-destructive';
  return 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400';
}

function QuantityCell({ row, kind }: { row: FarmerReportRequisition; kind: QuantityKind }) {
  if (kind === 'dispatched' && isNothingDispatched(row)) {
    return <span className="text-muted-foreground">None yet</span>;
  }
  if (kind === 'remaining' && isComplete(row)) {
    return <span className="font-medium text-primary">Complete</span>;
  }

  const lines = quantityLines(row, kind);
  return (
    <div className="tabular-nums">
      <div>{lines.primary ?? '—'}</div>
      {lines.secondary ? (
        <div className="text-xs text-muted-foreground">{lines.secondary}</div>
      ) : null}
    </div>
  );
}

export const contractColumns = columnHelper.columns([
  columnHelper.accessor((row) => row.farmer.name, {
    id: 'farmer',
    header: 'Farmer',
    cell: ({ row }) => (
      <div className="max-w-44 whitespace-normal">
        <div className="font-medium">{row.original.farmer.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.farmer.accountNumber}</div>
      </div>
    ),
    meta: { filterLabel: 'Farmer' },
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.farmer.station.name, {
    id: 'station',
    header: 'Station',
    meta: { filterLabel: 'Station' },
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.contractDate ?? '', {
    id: 'contractDate',
    header: 'Contract date',
    cell: ({ row }) => (
      <div className="max-w-28 whitespace-normal">
        <div>{formatContractDate(row.original.contractDate)}</div>
        {row.original.requisitionDate ? (
          <div className="text-xs text-muted-foreground">
            Requested {formatRequisitionDate(row.original.requisitionDate)}
          </div>
        ) : null}
      </div>
    ),
    meta: {
      filterLabel: 'Contract date',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatRequisitionDate(value) : 'Blank',
    },
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor((row) => row.variety.name, {
    id: 'variety',
    header: 'Variety',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    meta: { filterLabel: 'Variety' },
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.expectedSize?.name ?? '', {
    id: 'size',
    header: 'Size',
    cell: ({ row }) => {
      const size = row.original.expectedSize;
      if (!size) return '—';
      return (
        <div>
          <div className="font-medium">{size.name}</div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {size.seedBagsPerAcre} bags/ac
          </div>
        </div>
      );
    },
    meta: { filterLabel: 'Size' },
    sortFn: 'text',
  }),
  columnHelper.display({
    id: 'requested',
    header: 'Requested',
    cell: ({ row }) => <QuantityCell row={row.original} kind="requested" />,
    meta: { filterLabel: 'Requested' },
    enableSorting: false,
    enableColumnFilter: false,
    enableGrouping: false,
  }),
  columnHelper.display({
    id: 'dispatched',
    header: 'Dispatched',
    cell: ({ row }) => <QuantityCell row={row.original} kind="dispatched" />,
    meta: { filterLabel: 'Dispatched' },
    enableSorting: false,
    enableColumnFilter: false,
    enableGrouping: false,
  }),
  columnHelper.display({
    id: 'remaining',
    header: 'Remaining',
    cell: ({ row }) => <QuantityCell row={row.original} kind="remaining" />,
    meta: { filterLabel: 'Remaining' },
    enableSorting: false,
    enableColumnFilter: false,
    enableGrouping: false,
  }),
  columnHelper.accessor((row) => dispatchPercent(row), {
    id: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const percent = dispatchPercent(row.original);
      return (
        <div className="flex min-w-28 flex-col gap-1.5">
          <Progress
            value={percent}
            className="h-1.5"
            aria-label={formatDispatchPercent(row.original)}
          />
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDispatchPercent(row.original)}
          </span>
        </div>
      );
    },
    meta: { filterLabel: 'Progress' },
    enableColumnFilter: false,
    enableGrouping: false,
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    meta: {
      filterLabel: 'Status',
      filterValueFormatter: (value) =>
        value === 'APPROVED' || value === 'REJECTED' || value === 'PENDING'
          ? formatSeedRequisitionStatus(value)
          : 'Blank',
    },
    cell: ({ getValue }) => (
      <Badge variant="outline" className={statusBadgeClass(getValue())}>
        {formatSeedRequisitionStatus(getValue())}
      </Badge>
    ),
    sortFn: 'text',
  }),
]);
