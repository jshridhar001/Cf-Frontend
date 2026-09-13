import { createColumnHelper } from '@tanstack/react-table';
import { CheckIcon, MoreHorizontalIcon, SquarePenIcon, Trash2Icon, XIcon } from 'lucide-react';
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
  formatRequestedQuantity,
  formatRequisitionDate,
  formatSeedRequisitionStatus,
  type SeedRequisition,
} from '@/features/seed-requisition/overview/types';

export type RequisitionsTableMeta = {
  onEdit: (requisition: SeedRequisition) => void;
  onDelete: (requisition: SeedRequisition) => void;
  onApprove: (requisition: SeedRequisition) => void;
  onReject: (requisition: SeedRequisition) => void;
};

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

export const columns = columnHelper.columns([
  columnHelper.accessor((row) => row.farmer?.name ?? 'Unknown farmer', {
    id: 'farmer',
    header: 'Farmer',
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
  columnHelper.accessor((row) => row.variety?.name ?? 'Unknown variety', {
    id: 'variety',
    header: 'Variety',
  }),
  columnHelper.accessor((row) => formatRequestedQuantity(row), {
    id: 'quantity',
    header: 'Quantity',
  }),
  columnHelper.accessor('requisitionDate', {
    header: 'Requisition date',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatRequisitionDate(row.original.requisitionDate)}
      </span>
    ),
  }),
  columnHelper.accessor('requestedDeliveryDate', {
    header: 'Delivery date',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatRequisitionDate(row.original.requestedDeliveryDate)}
      </span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
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
  }),
]);
