import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { FarmerTableFeatures } from '@/features/farmers/overview/lib/table-features';
import {
  type Farmer,
  type FarmerPlace,
  formatFarmerAccountType,
  formatFarmerStatus,
  isFarmerAccountType,
  isFarmerStatus,
} from '@/features/farmers/overview/types';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';

export type FarmersTableMeta = {
  onEdit: (farmer: Farmer) => void;
  onDelete: (farmer: Farmer) => void;
};

const columnHelper = createColumnHelper<FarmerTableFeatures, Farmer>();

function blank(value: string | null | undefined) {
  const text = value?.trim();
  if (!text) return <span className="text-muted-foreground">—</span>;
  return text;
}

function placeName(place: FarmerPlace | null | undefined) {
  return place?.name?.trim() ?? '';
}

function placeColumn(
  id: keyof Pick<
    Farmer,
    'state' | 'district' | 'station' | 'policeStation' | 'pincode' | 'postOffice' | 'village'
  >,
  header: string,
) {
  return columnHelper.accessor((row) => placeName(row[id]), {
    id,
    header,
    sortFn: 'text',
    meta: { filterLabel: header },
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() || '—'}</span>,
  });
}

export const farmerColumns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Name',
    sortFn: 'text',
    meta: { filterLabel: 'Name' },
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor('accountNumber', {
    header: 'Account number',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Account number' },
  }),
  columnHelper.accessor('mobileNumber', {
    header: 'Mobile',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Mobile' },
  }),
  columnHelper.accessor('aadharNumber', {
    header: 'Aadhaar',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Aadhaar' },
    cell: ({ getValue }) => blank(getValue()),
  }),
  columnHelper.accessor('panNumber', {
    header: 'PAN',
    sortFn: 'text',
    meta: { filterLabel: 'PAN' },
    cell: ({ getValue }) => blank(getValue()),
  }),
  columnHelper.accessor('bankName', {
    header: 'Bank name',
    sortFn: 'text',
    meta: { filterLabel: 'Bank name' },
  }),
  columnHelper.accessor('bankAccountNumber', {
    header: 'Bank account number',
    sortFn: 'alphanumeric',
    meta: { filterLabel: 'Bank account number' },
  }),
  columnHelper.accessor('ifscCode', {
    header: 'IFSC',
    sortFn: 'text',
    meta: { filterLabel: 'IFSC' },
  }),
  columnHelper.accessor('accountType', {
    header: 'Account type',
    sortFn: 'text',
    meta: {
      filterLabel: 'Account type',
      filterValueFormatter: (value) =>
        typeof value === 'string' && isFarmerAccountType(value)
          ? formatFarmerAccountType(value)
          : 'Blank',
    },
    cell: ({ getValue }) => formatFarmerAccountType(getValue()),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    sortFn: 'text',
    meta: {
      filterLabel: 'Status',
      filterValueFormatter: (value) =>
        typeof value === 'string' && isFarmerStatus(value) ? formatFarmerStatus(value) : 'Blank',
    },
    cell: ({ row }) => {
      const isActive = row.original.status === 'ACTIVE';
      return (
        <Badge
          variant="outline"
          className={
            isActive
              ? 'border-primary/25 bg-primary/10 text-primary'
              : 'border-border bg-muted text-muted-foreground'
          }
        >
          {formatFarmerStatus(row.original.status)}
        </Badge>
      );
    },
  }),
  placeColumn('state', 'State'),
  placeColumn('district', 'District'),
  placeColumn('station', 'Station'),
  placeColumn('policeStation', 'Police station'),
  placeColumn('pincode', 'Pincode'),
  placeColumn('postOffice', 'Post office'),
  placeColumn('village', 'Village'),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Created',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatCreatedAt(value) : 'Blank',
    },
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className="text-sm text-muted-foreground">
          {value ? formatCreatedAt(value) : '—'}
        </span>
      );
    },
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Updated',
    sortFn: 'alphanumeric',
    meta: {
      filterLabel: 'Updated',
      filterValueFormatter: (value) =>
        typeof value === 'string' && value ? formatCreatedAt(value) : 'Blank',
    },
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className="text-sm text-muted-foreground">
          {value ? formatCreatedAt(value) : '—'}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as FarmersTableMeta | undefined;
      if (!meta) return null;
      return (
        <div className="flex justify-end">
          <MasterRowActions
            onEdit={() => meta.onEdit(row.original)}
            onDelete={() => meta.onDelete(row.original)}
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
