import { useNavigate } from '@tanstack/react-router';
import { FileText, PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFarmerContracts } from '@/features/farmers/api/use-farmer-contracts';
import { ContractDrawer } from '@/features/farmers/contract/components/contract-drawer';
import { DeleteContractDialog } from '@/features/farmers/contract/components/delete-contract-dialog';
import {
  type Farmer,
  type FarmerContractRow,
  formatContractAcres,
  formatContractDate,
} from '@/features/farmers/types';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import { getApiErrorMessage } from '@/lib/api-client';

function ContractUrlLink({ href }: { href: string }) {
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

function ContractsSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <Skeleton className="hidden h-48 w-full rounded-2xl md:block" />
      <div className="flex flex-col gap-2 md:hidden">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

export function FarmerProfileContracts({ farmer }: { farmer: Farmer }) {
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useFarmerContracts(farmer.id);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<FarmerContractRow | null>(null);
  const [deletingContract, setDeletingContract] = useState<FarmerContractRow | null>(null);

  const contracts = useMemo<FarmerContractRow[]>(
    () =>
      (data ?? []).map((contract) => ({
        ...contract,
        farmerId: farmer.id,
        farmerName: farmer.name,
      })),
    [data, farmer.id, farmer.name],
  );

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Farmer Contract</CardTitle>
        <CardDescription className="hidden sm:block">
          Contracts for {farmer.name}. Add or update variety, date, acres, and the contract URL.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add contract"
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && data === undefined ? <ContractsSkeleton /> : null}

        {isError && data === undefined ? (
          <Empty className="rounded-xl border bg-muted/10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>Could not load contracts</EmptyTitle>
              <EmptyDescription>{getApiErrorMessage(error)}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {data !== undefined ? (
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="hidden justify-end md:flex">
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                <PlusIcon data-icon="inline-start" />
                Add contract
              </Button>
            </div>

            {contracts.length === 0 ? (
              <Empty className="rounded-xl border bg-muted/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>No contracts yet</EmptyTitle>
                  <EmptyDescription>
                    Add a contract for this farmer to populate this list.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-2xl border md:block">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Variety</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Acres</TableHead>
                        <TableHead className="font-semibold">Contract URL</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow key={contract.id || `${contract.variety}-${contract.date}`}>
                          <TableCell>{contract.variety}</TableCell>
                          <TableCell>{formatContractDate(contract.date)}</TableCell>
                          <TableCell>{formatContractAcres(contract.acres)}</TableCell>
                          <TableCell>
                            <ContractUrlLink href={contract.contractUrl} />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <MasterRowActions
                                onView={() => {
                                  void navigate({
                                    to: '/farmers/$id/contract/$contractId',
                                    params: { id: contract.farmerId, contractId: contract.id },
                                  });
                                }}
                                onEdit={() => setEditingContract(contract)}
                                onDelete={() => setDeletingContract(contract)}
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
                      key={contract.id || `${contract.variety}-${contract.date}`}
                      variant="outline"
                      size="sm"
                      className="items-start"
                    >
                      <ItemHeader className="gap-3">
                        <ItemContent className="min-w-0 pr-1">
                          <ItemTitle>{contract.variety}</ItemTitle>
                          <ItemDescription>
                            {formatContractAcres(contract.acres)} acres ·{' '}
                            {formatContractDate(contract.date)}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions className="shrink-0 self-start">
                          <MasterRowActions
                            onView={() => {
                              void navigate({
                                to: '/farmers/$id/contract/$contractId',
                                params: { id: contract.farmerId, contractId: contract.id },
                              });
                            }}
                            onEdit={() => setEditingContract(contract)}
                            onDelete={() => setDeletingContract(contract)}
                          />
                        </ItemActions>
                      </ItemHeader>
                      <ItemFooter className="mt-1 flex-col items-start gap-1.5 border-t border-border/60 pt-2.5">
                        <ContractUrlLink href={contract.contractUrl} />
                      </ItemFooter>
                    </Item>
                  ))}
                </ItemGroup>
              </>
            )}
          </div>
        ) : null}
      </PageCardContent>

      <ContractDrawer
        farmers={[farmer]}
        defaultFarmerId={farmer.id}
        contract={editingContract}
        open={createOpen || editingContract !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditingContract(null);
          }
        }}
      />
      <DeleteContractDialog
        contract={deletingContract}
        open={deletingContract !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingContract(null);
        }}
      />
    </PageCard>
  );
}
