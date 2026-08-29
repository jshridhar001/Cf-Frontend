import { createColumnHelper } from '@tanstack/react-table';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import type { TuberSize } from '@/features/master/types';
import { formatSeedSize } from '@/lib/format-seed-size';

export type TuberSizesTableRow = TuberSize;

export type TuberSizesTableMeta = {
  onEdit?: (tuberSize: TuberSizesTableRow) => void;
  onDelete?: (tuberSize: TuberSizesTableRow) => void;
};

const columnHelper = createColumnHelper<MasterTableFeatures, TuberSizesTableRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Tuber Size',
    cell: ({ row }) => formatSeedSize(row.original.name),
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
      const meta = table.options.meta as TuberSizesTableMeta | undefined;
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
