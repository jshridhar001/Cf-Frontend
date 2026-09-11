import { type PaginationState, useTable } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ContractRowActions,
  ContractUrlLink,
  type FarmerContractsTableMeta,
  farmerContractColumns,
  NotarizedBadge,
} from '@/features/farmers/contract/components/farmer-contract-columns';
import { FarmerContractsPagination } from '@/features/farmers/contract/components/farmer-contracts-pagination';
import { farmerContractTableFeatures } from '@/features/farmers/contract/lib/farmer-contract-table-features';
import { FARMER_CONTRACT_PAGE_SIZE } from '@/features/farmers/contract/lib/pagination';
import {
  type FarmerContractRow,
  formatContractAcres,
  formatContractDate,
} from '@/features/farmers/contract/types';

export { ContractUrlLink } from '@/features/farmers/contract/components/farmer-contract-columns';

export function FarmerContractsList({
  contracts,
  emptyTitle,
  emptyDescription,
  onEdit,
  onDelete,
}: {
  contracts: FarmerContractRow[];
  emptyTitle: string;
  emptyDescription: string;
  onEdit: (contract: FarmerContractRow) => void;
  onDelete: (contract: FarmerContractRow) => void;
}) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: FARMER_CONTRACT_PAGE_SIZE,
  });

  const table = useTable(
    {
      features: farmerContractTableFeatures,
      data: contracts,
      columns: farmerContractColumns,
      getRowId: (contract) => `${contract.farmerId}-${contract.id}`,
      onPaginationChange: setPagination,
      autoResetPageIndex: true,
      state: {
        pagination,
      },
      meta: {
        onEdit,
        onDelete,
      } satisfies FarmerContractsTableMeta,
    },
    (state) => ({ pagination: state.pagination }),
  );

  if (contracts.length === 0) {
    return (
      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="hidden overflow-hidden rounded-2xl border md:block">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.id === 'actions' ? 'text-right font-semibold' : 'font-semibold'
                    }
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ItemGroup className="md:hidden">
        {rows.map((row) => {
          const contract = row.original;
          return (
            <Item key={row.id} variant="outline" size="sm" className="items-start">
              <ItemHeader className="gap-3">
                <ItemContent className="min-w-0 pr-1">
                  <ItemTitle>{contract.farmerName}</ItemTitle>
                  <ItemDescription>
                    {contract.variety} · {formatContractAcres(contract.acres)} acres ·{' '}
                    {formatContractDate(contract.date)}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="shrink-0 self-start">
                  <ContractRowActions contract={contract} onEdit={onEdit} onDelete={onDelete} />
                </ItemActions>
              </ItemHeader>
              <ItemFooter className="mt-1 flex-col items-start gap-1.5 border-t border-border/60 pt-2.5">
                <NotarizedBadge isNotarized={contract.isNotarized} />
                <p className="text-xs text-muted-foreground">English</p>
                <ContractUrlLink href={contract.contractUrl} />
                <p className="text-xs text-muted-foreground">Hindi</p>
                <ContractUrlLink href={contract.hindiContractUrl} />
              </ItemFooter>
            </Item>
          );
        })}
      </ItemGroup>

      <FarmerContractsPagination table={table} />
    </div>
  );
}
