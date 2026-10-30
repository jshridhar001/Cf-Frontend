import { createColumnHelper } from '@tanstack/react-table';
import type {
  FarmerReportDispatchedSize,
  FarmerReportRequisition,
} from '@/features/farmers/report/types';
import type { MasterTableFeatures } from '@/features/master/lib/master-table-features';
import {
  formatRequisitionDate,
  formatSeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

const columnHelper = createColumnHelper<MasterTableFeatures, FarmerReportRequisition>();

const QUANTITY_COLUMN_IDS = [
  'requestedBags',
  'requestedAcres',
  'dispatchedBags',
  'dispatchedAcres',
  'remainingBags',
  'remainingAcres',
] as const;

export const farmersReportNumericColumnIds = new Set<string>(QUANTITY_COLUMN_IDS);

function formatReportDate(value: string | null) {
  if (!value) return '—';
  return formatRequisitionDate(value);
}

function bagsColumn(id: 'requestedBags' | 'dispatchedBags' | 'remainingBags') {
  return columnHelper.accessor(id, {
    header: 'Bags',
    cell: ({ getValue }) => <span className="tabular-nums">{getValue() ?? '—'}</span>,
    sortFn: 'alphanumeric',
  });
}

function acresColumn(id: 'requestedAcres' | 'dispatchedAcres' | 'remainingAcres') {
  return columnHelper.accessor((row) => Number(row[id]), {
    id,
    header: 'Acres',
    cell: ({ row }) => <span className="tabular-nums">{row.original[id] ?? '—'}</span>,
    sortFn: 'alphanumeric',
  });
}

function quantityGroup(
  id: 'requested' | 'dispatched' | 'remaining',
  header: string,
  bags: 'requestedBags' | 'dispatchedBags' | 'remainingBags',
  acres: 'requestedAcres' | 'dispatchedAcres' | 'remainingAcres',
) {
  return columnHelper.group({
    id,
    header,
    enableSorting: false,
    columns: columnHelper.columns([bagsColumn(bags), acresColumn(acres)]),
  });
}

function DispatchedSizes({ sizes }: { sizes: FarmerReportDispatchedSize[] }) {
  if (sizes.length === 0) return '—';

  return (
    <ul className="flex flex-col gap-1 whitespace-normal">
      {sizes.map((size) => (
        <li key={size.sizeId}>
          {size.sizeName} · {size.bags} bags · {size.acres} acres · {size.seedBagsPerAcre} bags/acre
        </li>
      ))}
    </ul>
  );
}

export const farmersReportColumns = columnHelper.columns([
  columnHelper.accessor((row) => row.farmer.name, {
    id: 'farmer',
    header: 'Farmer',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.farmer.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.farmer.accountNumber}</div>
      </div>
    ),
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.farmer.station.name, {
    id: 'station',
    header: 'Station',
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.farmer.family?.name ?? '', {
    id: 'family',
    header: 'Family',
    cell: ({ getValue }) => getValue() || '—',
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.variety.name, {
    id: 'variety',
    header: 'Variety',
    sortFn: 'text',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => formatSeedRequisitionStatus(getValue()),
    sortFn: 'text',
  }),
  columnHelper.accessor('quantityUnit', {
    header: 'Unit',
    cell: ({ getValue }) => (getValue() === 'ACRES' ? 'Acres' : 'Bags'),
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.expectedSize?.name ?? '', {
    id: 'expectedSize',
    header: 'Expected size',
    cell: ({ row }) => {
      const size = row.original.expectedSize;
      if (!size) return '—';
      return (
        <div>
          <div>{size.name}</div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {size.seedBagsPerAcre} bags/acre
          </div>
        </div>
      );
    },
    sortFn: 'text',
  }),
  columnHelper.accessor((row) => row.requisitionDate ?? '', {
    id: 'requisitionDate',
    header: 'Requisition date',
    cell: ({ row }) => formatReportDate(row.original.requisitionDate),
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor((row) => row.contractDate ?? '', {
    id: 'contractDate',
    header: 'Contract date',
    cell: ({ row }) => formatReportDate(row.original.contractDate),
    sortFn: 'alphanumeric',
  }),
  quantityGroup('requested', 'Requested', 'requestedBags', 'requestedAcres'),
  quantityGroup('dispatched', 'Dispatched', 'dispatchedBags', 'dispatchedAcres'),
  quantityGroup('remaining', 'Remaining', 'remainingBags', 'remainingAcres'),
  columnHelper.display({
    id: 'dispatchedSizes',
    header: 'Dispatched sizes',
    cell: ({ row }) => <DispatchedSizes sizes={row.original.dispatchedSizes} />,
    enableSorting: false,
  }),
]);
