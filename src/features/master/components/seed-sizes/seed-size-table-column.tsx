import { createColumnHelper } from '@tanstack/react-table';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import type { SeedSize } from '@/features/master/types';
import { formatSeedSize } from '@/lib/format-seed-size';

export type SeedSizesTableRow = SeedSize;

export type SeedSizesTableMeta = {
  onEdit?: (seedSize: SeedSizesTableRow) => void;
  onDelete?: (seedSize: SeedSizesTableRow) => void;
};

const columnHelper = createColumnHelper<MasterTableFeatures, SeedSizesTableRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Seed Size',
    cell: ({ row }) => formatSeedSize(row.original.name),
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('seedBagsPerAcre', {
    header: 'Seed Bags per Acre',
    cell: ({ row }) =>
      row.original.seedBagsPerAcre == null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        row.original.seedBagsPerAcre
      ),
    sortFn: 'alphanumeric',
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as SeedSizesTableMeta | undefined;
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
