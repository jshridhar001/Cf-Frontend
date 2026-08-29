import { useQueryClient } from '@tanstack/react-query';
import { PlusIcon, RefreshCw, SearchIcon, Trash2Icon, Users } from 'lucide-react';
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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import { useFarmers } from '@/features/farmers/api/use-farmers';
import { DeleteAllFarmersDialog } from '@/features/farmers/overview/components/delete-all-farmers-dialog';
import { DeleteFarmerDialog } from '@/features/farmers/overview/components/delete-farmer-dialog';
import { FarmerCard } from '@/features/farmers/overview/components/farmer-card';
import { FarmerDrawer } from '@/features/farmers/overview/components/farmer-drawer';
import {
  FARMER_SORT_OPTIONS,
  type FarmerSortValue,
  filterAndSortFarmers,
  isFarmerSortValue,
} from '@/features/farmers/overview/types';
import type { Farmer } from '@/features/farmers/types';
import { useStations } from '@/features/master/api/use-stations';
import { getApiErrorMessage } from '@/lib/api-client';

const DEFAULT_SORT: FarmerSortValue = 'account-asc';

export default function FarmersOverviewPage() {
  const queryClient = useQueryClient();
  const { data: farmers, isPending, isError, error, isFetching } = useFarmers();
  const { data: stations } = useStations();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FarmerSortValue>(DEFAULT_SORT);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deletingFarmer, setDeletingFarmer] = useState<Farmer | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const farmerList = farmers ?? [];
  const canDeleteAll = farmerList.length > 0;

  const visibleFarmers = useMemo(
    () => filterAndSortFarmers(farmerList, search, sort),
    [farmerList, search, sort],
  );

  const peopleLabel = `${farmerList.length} ${farmerList.length === 1 ? 'farmer' : 'farmers'}`;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Farmers</CardTitle>
        <CardDescription className="hidden sm:block">
          Browse contracted farmers by station and locality.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Delete all farmers"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add farmer"
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent className="flex flex-col gap-4 sm:gap-6">
        {isPending && farmers === undefined ? (
          <p className="text-sm text-muted-foreground">Loading farmers…</p>
        ) : null}

        {isError && farmers === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {farmers !== undefined ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" aria-hidden />
                <span>{peopleLabel}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => {
                  setSearch('');
                  setSort(DEFAULT_SORT);
                  void queryClient.invalidateQueries({ queryKey: farmersKeys.list() });
                }}
              >
                <RefreshCw data-icon="inline-start" />
                Refresh
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <InputGroup className="w-full sm:max-w-xs">
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search by name"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </InputGroup>
              <Select
                value={sort}
                onValueChange={(value) => {
                  if (value && isFarmerSortValue(value)) setSort(value);
                }}
              >
                <SelectTrigger size="default" className="h-9 w-full sm:h-8 sm:w-56">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {FARMER_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="hidden items-center gap-2 sm:ml-auto md:flex">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!canDeleteAll}
                  onClick={() => setDeleteAllOpen(true)}
                >
                  <Trash2Icon data-icon="inline-start" />
                  Delete All
                </Button>
                <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                  <PlusIcon data-icon="inline-start" />
                  Add Farmer
                </Button>
              </div>
            </div>

            {visibleFarmers.length === 0 ? (
              <Empty className="border-0 py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users />
                  </EmptyMedia>
                  <EmptyTitle>No farmers found</EmptyTitle>
                  <EmptyDescription>
                    {farmerList.length === 0
                      ? 'Add a farmer to populate this overview.'
                      : 'Try a different name, or refresh to clear the search.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {visibleFarmers.map((farmer) => (
                  <FarmerCard
                    key={farmer.id}
                    farmer={farmer}
                    stations={stations}
                    onEdit={setEditingFarmer}
                    onDelete={setDeletingFarmer}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </PageCardContent>

      <FarmerDrawer
        farmer={editingFarmer}
        open={createOpen || editingFarmer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditingFarmer(null);
          }
        }}
      />
      <DeleteFarmerDialog
        farmer={deletingFarmer}
        open={deletingFarmer !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingFarmer(null);
        }}
      />
      <DeleteAllFarmersDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={farmerList.length}
      />
    </PageCard>
  );
}
