import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import type { ColdStorageGatePass } from '../types';

export type GatePassTableMeta = {
  onEdit?: (gatePass: ColdStorageGatePass) => void;
  onNullify?: (gatePass: ColdStorageGatePass) => void;
  onDelete?: (gatePass: ColdStorageGatePass) => void;
};

function gatePassActions(gatePass: ColdStorageGatePass, meta: GatePassTableMeta | undefined) {
  const isActive = gatePass.status === 'ACTIVE';
  return (
    <MasterRowActions
      onEdit={isActive ? () => meta?.onEdit?.(gatePass) : undefined}
      onNullify={isActive ? () => meta?.onNullify?.(gatePass) : undefined}
      onDelete={() => meta?.onDelete?.(gatePass)}
    />
  );
}

const columnHelper = createColumnHelper<MasterTableFeatures, ColdStorageGatePass>();

function formatGatePassDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'd MMM yyyy');
}

export const columns = columnHelper.columns([
  columnHelper.accessor((row) => row.facility.name, {
    id: 'coldStorageName',
    header: 'Cold storage',
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('gatePassDate', {
    header: 'Date',
    cell: ({ row }) => formatGatePassDate(row.original.gatePassDate),
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor((row) => row.variety.name, {
    id: 'varietyName',
    header: 'Variety',
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.generation.name, {
    id: 'generationName',
    header: 'Generation',
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.size.name, {
    id: 'sizeName',
    header: 'Size',
    sortFn: 'text',
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'NULL' ? 'secondary' : 'default'}>
        {row.original.status === 'NULL' ? 'Null' : 'Active'}
      </Badge>
    ),
    sortFn: 'text',
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as GatePassTableMeta | undefined;
      return <div className="flex justify-end">{gatePassActions(row.original, meta)}</div>;
    },
    enableSorting: false,
  }),
]);
