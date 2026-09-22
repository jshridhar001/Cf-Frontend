import { createColumnHelper } from '@tanstack/react-table';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import {
  ADDRESS_LEVEL_CONFIG,
  type AddressLevel,
  getAddressParentName,
  getAddressPath,
  getAddressPincode,
} from '@/features/master/lib/address-levels';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import type { AddressEntity } from '@/features/master/types/addresses';

export type AddressTableRow = AddressEntity;

export type AddressTableMeta = {
  onEdit?: (entity: AddressTableRow) => void;
  onDelete?: (entity: AddressTableRow) => void;
};

const columnHelper = createColumnHelper<MasterTableFeatures, AddressTableRow>();

export function createAddressColumns(level: AddressLevel) {
  const config = ADDRESS_LEVEL_CONFIG[level];

  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: 'Name',
      filterFn: 'includesString',
      sortFn: 'text',
    }),
    ...(config.hasPincode
      ? [
          columnHelper.accessor((row) => getAddressPincode(row) ?? '', {
            id: 'pincode',
            header: 'Pincode',
            sortFn: 'alphanumeric',
          }),
        ]
      : []),
    ...(config.parentLabel
      ? [
          columnHelper.accessor((row) => getAddressParentName(level, row) ?? '', {
            id: 'parent',
            header: config.parentLabel,
            sortFn: 'text',
          }),
        ]
      : []),
    ...(config.showPath
      ? [
          columnHelper.accessor((row) => getAddressPath(row) ?? '', {
            id: 'path',
            header: 'Address',
            sortFn: 'text',
            cell: ({ getValue }) => (
              <span className="text-sm text-muted-foreground">{getValue() || '—'}</span>
            ),
          }),
        ]
      : []),
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
        const meta = table.options.meta as AddressTableMeta | undefined;
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
}
