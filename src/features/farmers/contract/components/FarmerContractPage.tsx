import { FileText, PlusIcon, Search, UserPlus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
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
import { useFarmers } from '@/features/farmers/api/use-farmers';
import { ContractDrawer } from '@/features/farmers/contract/components/contract-drawer';
import { DeleteContractDialog } from '@/features/farmers/contract/components/delete-contract-dialog';
import { FarmerDrawer } from '@/features/farmers/overview/components/farmer-drawer';
import {
  type FarmerContractRow,
  flattenFarmerContracts,
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
      <Skeleton className="h-11 w-full rounded-lg sm:max-w-xs" />
      <Skeleton className="hidden h-48 w-full rounded-2xl md:block" />
      <div className="flex flex-col gap-2 md:hidden">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

export default function FarmerContractPage() {
  const { data: farmers, isPending, isError, error } = useFarmers();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createFarmerOpen, setCreateFarmerOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<FarmerContractRow | null>(null);
  const [deletingContract, setDeletingContract] = useState<FarmerContractRow | null>(null);

  const farmerList = farmers ?? [];
  const hasSearch = search.trim().length > 0;

  const contracts = useMemo(() => flattenFarmerContracts(farmerList), [farmerList]);

  const visibleContracts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contracts;
    return contracts.filter((contract) => contract.farmerName.toLowerCase().includes(query));
  }, [contracts, search]);

  if (isPending && farmers === undefined) {
    return (
      <PageCard>
        <PageCardHeader>
          <CardTitle>Contract</CardTitle>
          <CardDescription className="hidden sm:block">
            Create, update, and delete farmer contracts. Contracts load with the farmers list.
          </CardDescription>
        </PageCardHeader>
        <PageCardContent>
          <ContractsSkeleton />
        </PageCardContent>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Contract</CardTitle>
        <CardDescription className="hidden sm:block">
          Create, update, and delete farmer contracts. Contracts load with the farmers list.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add farmer"
            onClick={() => setCreateFarmerOpen(true)}
          >
            <UserPlus />
          </Button>
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
        {isError && farmers === undefined ? (
          <Empty className="rounded-xl border bg-muted/10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>Could not load contracts</EmptyTitle>
              <EmptyDescription>{getApiErrorMessage(error)}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by farmer name"
                  className="w-full pl-10"
                  inputMode="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="hidden items-center gap-2 sm:ml-auto md:flex">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateFarmerOpen(true)}
                >
                  <UserPlus data-icon="inline-start" />
                  Add farmer
                </Button>
                <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                  <PlusIcon data-icon="inline-start" />
                  Add contract
                </Button>
              </div>
            </div>

            {visibleContracts.length === 0 ? (
              <Empty className="rounded-xl border bg-muted/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>
                    {hasSearch ? 'No matching contracts' : 'No contracts yet'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {hasSearch
                      ? 'Try a different farmer name or clear the search.'
                      : 'Add a contract to a farmer to populate this list.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
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
                      {visibleContracts.map((contract) => (
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
                              <MasterRowActions
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
                  {visibleContracts.map((contract) => (
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
                          <MasterRowActions
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
        )}
      </PageCardContent>

      <FarmerDrawer farmer={null} open={createFarmerOpen} onOpenChange={setCreateFarmerOpen} />
      <ContractDrawer
        farmers={farmerList}
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
