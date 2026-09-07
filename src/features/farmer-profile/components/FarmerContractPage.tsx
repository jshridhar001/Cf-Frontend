import { FileText, PlusIcon, Search } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmers } from '@/features/farmers/api/use-farmers';
import { ContractDrawer } from '@/features/farmer-profile/components/contract-drawer';
import { DeleteContractDialog } from '@/features/farmer-profile/components/delete-contract-dialog';
import { FarmerContractsList } from '@/features/farmer-profile/components/farmer-contracts-list';
import { type FarmerContractRow, flattenFarmerContracts } from '@/features/farmers/types';
import { getApiErrorMessage } from '@/lib/api-client';

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
                <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                  <PlusIcon data-icon="inline-start" />
                  Add contract
                </Button>
              </div>
            </div>

            <FarmerContractsList
              contracts={visibleContracts}
              emptyTitle={hasSearch ? 'No matching contracts' : 'No contracts yet'}
              emptyDescription={
                hasSearch
                  ? 'Try a different farmer name or clear the search.'
                  : 'Add a contract to a farmer to populate this list.'
              }
              onEdit={setEditingContract}
              onDelete={setDeletingContract}
            />
          </div>
        )}
      </PageCardContent>

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
