import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import {
  EyeIcon,
  FileSignatureIcon,
  MoreHorizontalIcon,
  SquarePenIcon,
  Trash2Icon,
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
import { RequestedDeliveryLines } from '@/features/seed-requisition/overview/components/requested-delivery-lines';
import {
  earliestRequestedDeliveryDate,
  statusFromDeliveries,
} from '@/features/seed-requisition/overview/lib/requested-deliveries';
import {
  formatSummaryAcres,
  formatSummaryCount,
} from '@/features/seed-requisition/overview/lib/summary';
import {
  formatRequisitionDate,
  formatSeedRequisitionStatus,
  getRequisitionFamilyLabel,
  getRequisitionPlaceName,
  type SeedRequisition,
  type SeedRequisitionDelivery,
} from '@/features/seed-requisition/overview/types';

export type RequisitionsTableMeta = {
  onEdit: (requisition: SeedRequisition) => void;
  onDelete: (requisition: SeedRequisition) => void;
  onApproveDelivery: (requisition: SeedRequisition, delivery: SeedRequisitionDelivery) => void;
  onRejectDelivery: (requisition: SeedRequisition, delivery: SeedRequisitionDelivery) => void;
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
}: {
  requisition: SeedRequisition;
  onEdit: (requisition: SeedRequisition) => void;
  onDelete: (requisition: SeedRequisition) => void;
}) {
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
  columnHelper.accessor((row) => getRequisitionFamilyLabel(row.farmer), {
    id: 'family',
    header: 'Family',
    sortFn: 'text',
    meta: { filterLabel: 'Family' },
    cell: ({ getValue }) => {
      const label = getValue();
      return label === 'Independent' ? (
        <span className="text-muted-foreground">{label}</span>
      ) : (
        <span className="font-medium">{label}</span>
      );
    },
  }),
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
  columnHelper.accessor((row) => earliestRequestedDeliveryDate(row.requestedDeliveries) ?? '', {
    id: 'requestedDeliveries',
    header: 'Requested deliveries',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Requested deliveries',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatRequisitionDate(value) : 'Blank',
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta as RequisitionsTableMeta | undefined;
      return (
        <RequestedDeliveryLines
          requisition={row.original}
          onApprove={(delivery) => meta?.onApproveDelivery(row.original, delivery)}
          onReject={(delivery) => meta?.onRejectDelivery(row.original, delivery)}
        />
      );
    },
  }),
  columnHelper.accessor((row) => row.remarks ?? '', {
    id: 'remarks',
    header: 'Remarks',
    sortFn: 'text',
    meta: { filterLabel: 'Remarks' },
    cell: ({ getValue }) => {
      const remarks = getValue().trim();
      if (!remarks) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="block max-w-xs line-clamp-2" title={remarks}>
          {remarks}
        </span>
      );
    },
  }),
  columnHelper.accessor((row) => statusFromDeliveries(row.requestedDeliveries), {
    id: 'status',
    header: 'Status',
    sortFn: 'text',
    meta: {
      filterLabel: 'Status',
      filterValueFormatter: (value) =>
        typeof value === 'string'
          ? formatSeedRequisitionStatus(value as SeedRequisition['status'])
          : 'Blank',
    },
    cell: ({ getValue }) => (
      <Badge variant="outline" className={statusBadgeClass(getValue())}>
        {formatSeedRequisitionStatus(getValue())}
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
