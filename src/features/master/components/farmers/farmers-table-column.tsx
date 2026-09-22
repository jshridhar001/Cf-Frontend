import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  formatFarmerStatus,
  type Farmer,
  getFarmerLocalityName,
  getFarmerStationName,
} from '@/features/farmers/overview/types';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';

export type FarmersTableRow = Farmer;

export type FarmersTableMeta = {
  onEdit?: (farmer: FarmersTableRow) => void;
  onDelete?: (farmer: FarmersTableRow) => void;
};

const columnHelper = createColumnHelper<MasterTableFeatures, FarmersTableRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Name',
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('accountNumber', {
    header: 'Account #',
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor('mobileNumber', {
    header: 'Mobile',
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor((row) => getFarmerStationName(row), {
    id: 'station',
    header: 'Station',
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => getFarmerLocalityName(row), {
    id: 'locality',
    header: 'Locality',
    sortFn: 'text',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.status === 'ACTIVE';
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {formatFarmerStatus(row.original.status)}
        </Badge>
      );
    },
    sortFn: 'text',
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as FarmersTableMeta | undefined;
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
