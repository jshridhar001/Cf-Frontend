import { createColumnHelper } from '@tanstack/react-table';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import type { NamedMaster } from '@/features/master/types';

export type NamedMasterTableMeta = {
  onEdit?: (item: NamedMaster) => void;
  onDelete?: (item: NamedMaster) => void;
};

const columnHelper = createColumnHelper<MasterTableFeatures, NamedMaster>();

export function createNamedMasterColumns(nameHeader: string) {
  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: nameHeader,
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
        const meta = table.options.meta as NamedMasterTableMeta | undefined;
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
