import { useNavigate } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { FarmerContractTableFeatures } from '@/features/farmers/contract/lib/farmer-contract-table-features';
import {
  type FarmerContractRow,
  formatContractAcres,
  formatContractDate,
} from '@/features/farmers/contract/types';
import { MasterRowActions } from '@/features/master/components/master-row-actions';

export type FarmerContractsTableMeta = {
  onEdit: (contract: FarmerContractRow) => void;
  onDelete: (contract: FarmerContractRow) => void;
};

export function ContractUrlLink({ href }: { href: string }) {
  if (!href) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium break-all text-primary underline underline-offset-4"
    >
      {href}
    </a>
  );
}

export function NotarizedBadge({ isNotarized }: { isNotarized: boolean }) {
  return (
    <Badge variant={isNotarized ? 'secondary' : 'outline'}>
      {isNotarized ? 'Notarized' : 'Not notarized'}
    </Badge>
  );
}

export function ContractRowActions({
  contract,
  onEdit,
  onDelete,
}: {
  contract: FarmerContractRow;
  onEdit: (contract: FarmerContractRow) => void;
  onDelete: (contract: FarmerContractRow) => void;
}) {
  const navigate = useNavigate();

  return (
    <MasterRowActions
      onView={() => {
        void navigate({
          to: '/farmers/$id/contract/$contractId',
          params: { id: contract.farmerId, contractId: contract.id },
        });
      }}
      onEdit={() => onEdit(contract)}
      onDelete={() => onDelete(contract)}
    />
  );
}

const columnHelper = createColumnHelper<FarmerContractTableFeatures, FarmerContractRow>();

export const farmerContractColumns = columnHelper.columns([
  columnHelper.accessor('farmerName', {
    header: 'Farmer name',
  }),
  columnHelper.accessor('variety', {
    header: 'Variety',
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: ({ row }) => formatContractDate(row.original.date),
  }),
  columnHelper.accessor('acres', {
    header: 'Acres',
    cell: ({ row }) => formatContractAcres(row.original.acres),
  }),
  columnHelper.accessor('contractUrl', {
    header: 'English URL',
    cell: ({ row }) => <ContractUrlLink href={row.original.contractUrl} />,
  }),
  columnHelper.accessor('hindiContractUrl', {
    header: 'Hindi URL',
    cell: ({ row }) => <ContractUrlLink href={row.original.hindiContractUrl} />,
  }),
  columnHelper.accessor('isNotarized', {
    header: 'Notarized',
    cell: ({ row }) => <NotarizedBadge isNotarized={row.original.isNotarized} />,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as FarmerContractsTableMeta | undefined;
      if (!meta) return null;
      return (
        <div className="flex justify-end">
          <ContractRowActions
            contract={row.original}
            onEdit={meta.onEdit}
            onDelete={meta.onDelete}
          />
        </div>
      );
    },
  }),
]);
