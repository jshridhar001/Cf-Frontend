import { createColumnHelper } from '@tanstack/react-table';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import type { FacilityStock } from '@/features/master/types';

export type FacilityStockTableRow = FacilityStock & {
  varietyName: string;
  sizeName: string;
  generationName: string;
};

export type FacilityStockTableMeta = {
  onEdit?: (stock: FacilityStockTableRow) => void;
  onDelete?: (stock: FacilityStockTableRow) => void;
};

const columnHelper = createColumnHelper<MasterTableFeatures, FacilityStockTableRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor('varietyName', {
    header: 'Variety',
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('sizeName', {
    header: 'Seed size',
    sortFn: 'text',
  }),
  columnHelper.accessor('generationName', {
    header: 'Generation',
    sortFn: 'text',
  }),
  columnHelper.accessor('initialQuantity', {
    header: 'Initial quantity',
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor('currentQuantity', {
    header: 'Current quantity',
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
      const meta = table.options.meta as FacilityStockTableMeta | undefined;
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
