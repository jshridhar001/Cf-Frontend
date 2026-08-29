import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import { getFacilityUsedInLabel } from '@/features/master/lib/facility-used-in';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import type { Facility } from '@/features/master/types';

export type FacilitiesTableRow = Facility;

export type FacilitiesTableMeta = {
  onEdit?: (facility: FacilitiesTableRow) => void;
  onDelete?: (facility: FacilitiesTableRow) => void;
};

const columnHelper = createColumnHelper<MasterTableFeatures, FacilitiesTableRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Facility Name',
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('usedIn', {
    header: 'Used In',
    cell: ({ row }) => (
      <Badge variant="outline">{getFacilityUsedInLabel(row.original.usedIn)}</Badge>
    ),
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('totalBagsDispatched', {
    header: 'Total Bags Dispatched',
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created At',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatCreatedAt(row.original.createdAt)}
      </span>
    ),
    sortFn: 'alphanumeric',
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as FacilitiesTableMeta | undefined;
      return (
        <div className="flex justify-end">
          <MasterRowActions
            onEdit={() => meta?.onEdit?.(row.original)}
            onDelete={() => meta?.onDelete?.(row.original)}
          />
        </div>
      );
    },
    enableSorting: false,
  }),
]);
