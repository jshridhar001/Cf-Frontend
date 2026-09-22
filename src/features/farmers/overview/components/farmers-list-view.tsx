import { useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Loader2, RefreshCw, Search, Table2, Trash2Icon, UserPlus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { DeleteAllFarmersDialog } from '@/features/farmers/overview/components/delete-all-farmers-dialog';
import { DeleteFarmerDialog } from '@/features/farmers/overview/components/delete-farmer-dialog';
import { FarmerCard } from '@/features/farmers/overview/components/farmer-card';
import { FarmerDrawer } from '@/features/farmers/overview/components/farmer-drawer';
import {
  FARMER_SORT_OPTIONS,
  type FarmerSortValue,
  farmerHasContracts,
  filterAndSortFarmers,
  isFarmerSortValue,
} from '@/features/farmers/overview/lib/filter-sort';
import type { Farmer } from '@/features/farmers/overview/types';
import { FarmersTable } from '@/features/master/components/farmers/farmers-table';
import { columns as farmersTableColumns } from '@/features/master/components/farmers/farmers-table-column';
import { getApiErrorMessage } from '@/lib/api-client';

const DEFAULT_SORT: FarmerSortValue = 'account-asc';

type OverviewLayout = 'cards' | 'table';
const DESKTOP_LAYOUT_QUERY = '(min-width: 768px)';

function isOverviewLayout(value: string): value is OverviewLayout {
  return value === 'cards' || value === 'table';
}

function getDefaultOverviewLayout(): OverviewLayout {
  if (typeof window === 'undefined') return 'cards';
  return window.matchMedia(DESKTOP_LAYOUT_QUERY).matches ? 'table' : 'cards';
}

type FarmersListViewProps = {
  onlyWithContracts?: boolean;
  showLayoutToggle?: boolean;
};

function FarmersListSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-40 rounded-4xl" />
        <Skeleton className="h-40 rounded-4xl" />
        <Skeleton className="hidden h-40 rounded-4xl sm:block" />
      </div>
    </div>
  );
}

export function FarmersListView({
  onlyWithContracts = false,
  showLayoutToggle = false,
}: FarmersListViewProps) {
  const queryClient = useQueryClient();
  const { data: farmers, isPending, isError, error, isFetching } = useFarmers();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FarmerSortValue>(DEFAULT_SORT);
  const [layout, setLayout] = useState<OverviewLayout>(getDefaultOverviewLayout);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deletingFarmer, setDeletingFarmer] = useState<Farmer | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const farmerList = useMemo(() => {
    const all = farmers ?? [];
    return onlyWithContracts ? all.filter(farmerHasContracts) : all;
  }, [farmers, onlyWithContracts]);

  const allFarmersCount = farmers?.length ?? 0;
  const canDeleteAll = allFarmersCount > 0;
  const hasSearch = search.trim().length > 0;

  const visibleFarmers = useMemo(
    () => filterAndSortFarmers(farmerList, search, sort),
    [farmerList, search, sort],
  );

  const peopleLabel = `${farmerList.length} ${farmerList.length === 1 ? 'farmer' : 'farmers'}`;

  const refreshList = () => {
    setSearch('');
    setSort(DEFAULT_SORT);
    void queryClient.invalidateQueries({ queryKey: farmersKeys.list() });
  };

  if (isPending && farmers === undefined) {
    return <FarmersListSkeleton />;
  }

  const emptyState =
    isError && farmers === undefined ? (
      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>Could not load farmers</EmptyTitle>
          <EmptyDescription>{getApiErrorMessage(error)}</EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" className="mt-4" onClick={refreshList} disabled={isFetching}>
          {isFetching ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <RefreshCw data-icon="inline-start" />
          )}
          Try again
        </Button>
      </Empty>
    ) : visibleFarmers.length === 0 ? (
      <Empty className="rounded-xl border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>
            {hasSearch
              ? 'No matching farmers'
              : onlyWithContracts
                ? 'No farmers with contracts yet'
                : 'No farmers yet'}
          </EmptyTitle>
          <EmptyDescription>
            {hasSearch
              ? 'Try a different name or clear the search.'
              : onlyWithContracts
                ? 'Farmers appear here once they have at least one contract.'
                : 'Add a farmer to populate this list.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : null;

  const cardsGrid =
    emptyState ??
    (visibleFarmers.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleFarmers.map((farmer) => (
          <FarmerCard
            key={farmer.id}
            farmer={farmer}
            onEdit={setEditingFarmer}
            onDelete={setDeletingFarmer}
          />
        ))}
      </div>
    ) : null);

  const tableView =
    emptyState ??
    (visibleFarmers.length > 0 ? (
      <FarmersTable
        columns={farmersTableColumns}
        data={visibleFarmers}
        onEdit={setEditingFarmer}
        onDelete={setDeletingFarmer}
      />
    ) : null);

  const toolbar = (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="p-3 sm:p-4">
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name"
            className="w-full pl-10"
            inputMode="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
        <Select
          value={sort}
          onValueChange={(value) => {
            if (value && isFarmerSortValue(value)) setSort(value);
          }}
        >
          <SelectTrigger className="h-11 w-full min-w-0 sm:h-9 sm:w-55">
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

        <div className="flex min-w-0 items-center gap-2 sm:shrink-0">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="size-11 shrink-0 rounded-full md:hidden"
            aria-label="Delete all farmers"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="hidden md:inline-flex"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete All
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-11 min-w-0 flex-1 gap-1.5 sm:h-9 sm:flex-none sm:w-auto"
            onClick={() => setCreateOpen(true)}
            aria-label="Add farmer"
          >
            <UserPlus className="size-4 shrink-0" />
            <span className="hidden sm:inline">Add Farmer</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const dialogs = (
    <>
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
        count={allFarmersCount}
      />
    </>
  );

  if (!showLayoutToggle) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <Item variant="outline" size="sm">
          <ItemMedia variant="icon">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{peopleLabel}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm" onClick={refreshList} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <RefreshCw data-icon="inline-start" />
              )}
              Refresh
            </Button>
          </ItemActions>
        </Item>

        {toolbar}
        {cardsGrid}
        {dialogs}
      </div>
    );
  }

  return (
    <Tabs
      value={layout}
      onValueChange={(value) => {
        if (isOverviewLayout(value)) setLayout(value);
      }}
      className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6"
    >
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{peopleLabel}</ItemTitle>
        </ItemContent>
        <ItemActions>
          <TabsList className="h-11 min-h-11 w-fit group-data-horizontal/tabs:h-11 md:h-9 md:min-h-9 md:group-data-horizontal/tabs:h-9">
            <TabsTrigger value="table" aria-label="Table layout" className="gap-1.5 px-2.5">
              <Table2 />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="cards" aria-label="Cards layout" className="gap-1.5 px-2.5">
              <LayoutGrid />
              <span className="hidden sm:inline">Cards</span>
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={refreshList} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      {toolbar}

      <TabsContent value="table" className="min-w-0">
        {tableView}
      </TabsContent>
      <TabsContent value="cards">{cardsGrid}</TabsContent>

      {dialogs}
    </Tabs>
  );
}
