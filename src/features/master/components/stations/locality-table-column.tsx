import { createColumnHelper } from '@tanstack/react-table';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import type { Locality } from '@/features/master/types';

export type LocalitiesTableRow = Locality;

export type LocalitiesTableMeta = {
  onEdit?: (locality: LocalitiesTableRow) => void;
  onDelete?: (locality: LocalitiesTableRow) => void;
};

const columnHelper = createColumnHelper<MasterTableFeatures, LocalitiesTableRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Locality Name',
    filterFn: 'includesString',
    sortFn: 'text',
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
      const meta = table.options.meta as LocalitiesTableMeta | undefined;
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
