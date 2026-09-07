import { useNavigate } from '@tanstack/react-router';
import { FileText } from 'lucide-react';
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
  type FarmerContractRow,
  formatContractAcres,
  formatContractDate,
} from '@/features/farmers/types';
import { MasterRowActions } from '@/features/master/components/master-row-actions';

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

function ContractRowActions({
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

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border md:block">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Farmer name</TableHead>
              <TableHead className="font-semibold">Variety</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Acres</TableHead>
              <TableHead className="font-semibold">Contract URL</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={`${contract.farmerId}-${contract.id}`}>
                <TableCell>{contract.farmerName}</TableCell>
                <TableCell>{contract.variety}</TableCell>
                <TableCell>{formatContractDate(contract.date)}</TableCell>
                <TableCell>{formatContractAcres(contract.acres)}</TableCell>
                <TableCell>
                  <ContractUrlLink href={contract.contractUrl} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <ContractRowActions
                      contract={contract}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ItemGroup className="md:hidden">
        {contracts.map((contract) => (
          <Item
            key={`${contract.farmerId}-${contract.id}`}
            variant="outline"
            size="sm"
            className="items-start"
          >
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
              <ContractUrlLink href={contract.contractUrl} />
            </ItemFooter>
          </Item>
        ))}
      </ItemGroup>
    </>
  );
}
