import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import {
  CheckIcon,
  EyeIcon,
  FileSignatureIcon,
  MoreHorizontalIcon,
  SquarePenIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
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
import type { DataTableFeatures } from '@/features/seed-requisition/overview/components/data-table-features';
import {
  formatSummaryAcres,
  formatSummaryCount,
} from '@/features/seed-requisition/overview/lib/summary';
import {
  formatRequisitionDate,
  formatSeedRequisitionStatus,
  getRequisitionPlaceName,
  type SeedRequisition,
} from '@/features/seed-requisition/overview/types';

export type RequisitionsTableMeta = {
  onEdit: (requisition: SeedRequisition) => void;
  onDelete: (requisition: SeedRequisition) => void;
  onApprove: (requisition: SeedRequisition) => void;
  onReject: (requisition: SeedRequisition) => void;
};

function hasRequestedAcres(requisition: SeedRequisition) {
  return requisition.requestedAcres != null && requisition.requestedAcres !== '';
}

function acresAccessorValue(requisition: SeedRequisition) {
  if (!hasRequestedAcres(requisition)) return 0;
  const acres = Number(requisition.requestedAcres);
  return Number.isFinite(acres) ? acres : 0;
}

function formatAggregatedNumber(value: unknown, format: (n: number) => string) {
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount)) return '—';
  return format(amount);
}

function statusBadgeClass(status: SeedRequisition['status']) {
  if (status === 'APPROVED') {
    return 'border-primary/25 bg-primary/10 text-primary';
  }
  if (status === 'REJECTED') {
    return 'border-destructive/25 bg-destructive/10 text-destructive';
  }
  return 'border-border bg-muted text-muted-foreground';
}

function RequisitionRowActions({
  requisition,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: {
  requisition: SeedRequisition;
  onEdit: (requisition: SeedRequisition) => void;
  onDelete: (requisition: SeedRequisition) => void;
  onApprove: (requisition: SeedRequisition) => void;
  onReject: (requisition: SeedRequisition) => void;
}) {
  const isPending = requisition.status === 'PENDING';

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
        {isPending ? (
          <>
            <DropdownMenuItem onClick={() => onApprove(requisition)}>
              <CheckIcon />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onReject(requisition)}>
              <XIcon />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <Link to="/seed-requisition/$id" params={{ id: requisition.id }}>
            <EyeIcon />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/seed-requisition/$id/contract" params={{ id: requisition.id }}>
            <FileSignatureIcon />
            Contract
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(requisition)}>
          <SquarePenIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(requisition)}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columnHelper = createColumnHelper<DataTableFeatures, SeedRequisition>();

type FarmerPlaceKey =
  | 'state'
  | 'district'
  | 'station'
  | 'policeStation'
  | 'pincode'
  | 'postOffice'
  | 'village';

function contractUrlColumn(id: 'engContractUrl' | 'hindiContractUrl', header: string) {
  return columnHelper.accessor((row) => row[id] ?? '', {
    id,
    header,
    sortFn: 'text',
    meta: { filterLabel: header },
    cell: ({ getValue }) => {
      const url = getValue().trim();
      if (!url) return <span className="text-muted-foreground">—</span>;
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title={url}
          className="block max-w-48 truncate font-medium text-primary underline underline-offset-4"
        >
          {url}
        </a>
      );
    },
  });
}

function farmerPlaceColumn(id: FarmerPlaceKey, header: string) {
  return columnHelper.accessor((row) => getRequisitionPlaceName(row.farmer?.[id]), {
    id,
    header,
    sortFn: 'text',
    meta: { filterLabel: header },
    cell: ({ getValue }) => {
      const name = getValue();
      return <span className="text-muted-foreground">{name || '—'}</span>;
    },
  });
}

export const columns = columnHelper.columns([
  columnHelper.accessor((row) => row.farmer?.name ?? 'Unknown farmer', {
    id: 'farmer',
    header: 'Farmer',
    sortFn: 'text',
    meta: { filterLabel: 'Farmer' },
    cell: ({ row }) => {
      const farmerName = row.original.farmer?.name ?? 'Unknown farmer';
      const accountNumber = row.original.farmer?.accountNumber;

      return (
        <div className="min-w-0 font-medium">
          {farmerName}{' '}
          {accountNumber ? (
            <span className="text-sm font-normal text-muted-foreground">(#{accountNumber})</span>
          ) : null}
        </div>
      );
    },
  }),
  farmerPlaceColumn('state', 'State'),
  farmerPlaceColumn('district', 'District'),
  farmerPlaceColumn('station', 'Station'),
  farmerPlaceColumn('policeStation', 'Police station'),
  farmerPlaceColumn('pincode', 'Pincode'),
  farmerPlaceColumn('postOffice', 'Post office'),
  farmerPlaceColumn('village', 'Village'),
  columnHelper.accessor((row) => row.variety?.name ?? 'Unknown variety', {
    id: 'variety',
    header: 'Variety',
    sortFn: 'text',
    meta: { filterLabel: 'Variety' },
  }),
  columnHelper.accessor((row) => row.requestedBags ?? 0, {
    id: 'bags',
    header: 'Bags',
    sortFn: 'alphanumeric',
    aggregationFn: 'sum',
    meta: { filterLabel: 'Bags' },
    cell: ({ row }) =>
      row.original.requestedBags == null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        formatSummaryCount(row.original.requestedBags)
      ),
    aggregatedCell: ({ getValue }) => formatAggregatedNumber(getValue(), formatSummaryCount),
  }),
  columnHelper.accessor((row) => acresAccessorValue(row), {
    id: 'acres',
    header: 'Acres',
    sortFn: 'alphanumeric',
    aggregationFn: 'sum',
    meta: { filterLabel: 'Acres' },
    cell: ({ row }) =>
      hasRequestedAcres(row.original) ? (
        formatSummaryAcres(acresAccessorValue(row.original))
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    aggregatedCell: ({ getValue }) => formatAggregatedNumber(getValue(), formatSummaryAcres),
  }),
  columnHelper.accessor('contractDate', {
    header: 'Contract date',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Contract date',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatRequisitionDate(value) : 'Blank',
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.contractDate ? formatRequisitionDate(row.original.contractDate) : '—'}
      </span>
    ),
  }),
  contractUrlColumn('engContractUrl', 'English contract'),
  contractUrlColumn('hindiContractUrl', 'Hindi contract'),
  columnHelper.accessor('requisitionDate', {
    header: 'Requisition date',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Requisition date',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatRequisitionDate(value) : 'Blank',
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.requisitionDate ? formatRequisitionDate(row.original.requisitionDate) : '—'}
      </span>
    ),
  }),
  columnHelper.accessor('requestedDeliveryDate', {
    header: 'Delivery date',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Delivery date',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatRequisitionDate(value) : 'Blank',
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.requestedDeliveryDate
          ? formatRequisitionDate(row.original.requestedDeliveryDate)
          : '—'}
      </span>
    ),
  }),
  columnHelper.accessor('approvedDeliveryDate', {
    header: 'Approved delivery',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Approved delivery',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatRequisitionDate(value) : 'Blank',
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.approvedDeliveryDate
          ? formatRequisitionDate(row.original.approvedDeliveryDate)
          : '—'}
      </span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    sortFn: 'text',
    meta: {
      filterLabel: 'Status',
      filterValueFormatter: (value) =>
        typeof value === 'string'
          ? formatSeedRequisitionStatus(value as SeedRequisition['status'])
          : 'Blank',
    },
    cell: ({ row }) => (
      <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
        {formatSeedRequisitionStatus(row.original.status)}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as RequisitionsTableMeta | undefined;
      if (!meta) return null;

      return (
        <div className="flex justify-end">
          <RequisitionRowActions
            requisition={row.original}
            onEdit={meta.onEdit}
            onDelete={meta.onDelete}
            onApprove={meta.onApprove}
            onReject={meta.onReject}
          />
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    enableGrouping: false,
    enableHiding: false,
    enableGlobalFilter: false,
  }),
]);
