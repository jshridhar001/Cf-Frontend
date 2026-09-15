import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi, Link } from '@tanstack/react-router';
import { type PaginationState } from '@tanstack/react-table';
import {
  FileText,
  LayoutGrid,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Truck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import { useSeedDispatches } from '@/features/seed-dispatch/overview/api/use-seed-dispatches';
import { DataTable } from '@/features/seed-dispatch/overview/components/data-table';
import { DispatchCard } from '@/features/seed-dispatch/overview/components/dispatch-card';
import { DispatchPagination } from '@/features/seed-dispatch/overview/components/dispatch-pagination';
import { DispatchSummaryCards } from '@/features/seed-dispatch/overview/components/dispatch-summary-cards';
import { useDispatchesTable } from '@/features/seed-dispatch/overview/components/use-dispatches-table';
import { ViewFiltersSheet } from '@/features/seed-dispatch/overview/components/view-filters/ViewFiltersSheet';
import {
  emptyGlobalFilter,
  isActiveCondition,
  isAdvancedGlobalFilter,
} from '@/features/seed-dispatch/overview/lib/filter-fns';
import { hasActiveFilters, toListParams } from '@/features/seed-dispatch/overview/lib/search';
import { summarizeDispatches } from '@/features/seed-dispatch/overview/lib/summary';
import type { SeedDispatchStatus } from '@/features/seed-dispatch/overview/types';
import {
  formatSeedDispatchStatus,
  isSeedDispatchStatus,
  SEED_DISPATCH_PAGE_SIZE,
  SEED_DISPATCH_STATUSES,
} from '@/features/seed-dispatch/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';

const ALL_STATUSES = 'all';
const overviewRoute = getRouteApi('/_authenticated/seed-dispatches/overview');

type OverviewLayout = 'cards' | 'table';
const DESKTOP_LAYOUT_QUERY = '(min-width: 768px)';

function isOverviewLayout(value: string): value is OverviewLayout {
  return value === 'cards' || value === 'table';
}

function getDefaultOverviewLayout(): OverviewLayout {
  if (typeof window === 'undefined') return 'cards';
  return window.matchMedia(DESKTOP_LAYOUT_QUERY).matches ? 'table' : 'cards';
}

function SeedDispatchOverviewSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="hidden h-64 rounded-xl md:block" />
      <div className="grid gap-4 sm:grid-cols-2 md:hidden">
        <Skeleton className="h-40 rounded-4xl" />
        <Skeleton className="h-40 rounded-4xl" />
      </div>
    </div>
  );
}

export default function SeedDispatchOverviewPage() {
  const queryClient = useQueryClient();
  const searchParams = overviewRoute.useSearch();
  const navigate = overviewRoute.useNavigate();
  const listParams = toListParams(searchParams);
  const { data, isPending, isError, error, isFetching } = useSeedDispatches(listParams);
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<OverviewLayout>(getDefaultOverviewLayout);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: SEED_DISPATCH_PAGE_SIZE,
  });

  const dispatchList = data?.items ?? [];
  const hasSearch = search.trim().length > 0;

  const summary = useMemo(() => summarizeDispatches(dispatchList), [dispatchList]);

  const table = useDispatchesTable({
    data: dispatchList,
    pagination,
    onPaginationChange: setPagination,
    status: searchParams.status,
  });

  const pagedDispatches = table
    .getRowModel()
    .rows.filter((row) => !row.getIsGrouped())
    .map((row) => row.original);
  const tableFiltersActive =
    table.state.columnFilters.length > 0 ||
    table.state.grouping.length > 0 ||
    (isAdvancedGlobalFilter(table.state.globalFilter) &&
      table.state.globalFilter.conditions.some(isActiveCondition));
  const hasFilters = hasSearch || hasActiveFilters(searchParams) || tableFiltersActive;

  const setStatusFilter = (status: SeedDispatchStatus | undefined) => {
    void navigate({
      search: (prev) => {
        if (!status) {
          const { status: _status, ...rest } = prev;
          return rest;
        }
        return { ...prev, status };
      },
    });
  };

  const refreshList = () => {
    setSearch('');
    table.setGlobalFilter((current: unknown) => {
      const base = isAdvancedGlobalFilter(current) ? current : emptyGlobalFilter();
      return { ...base, manualSearch: '' };
    });
    table.resetSorting();
    void queryClient.invalidateQueries({ queryKey: seedDispatchKeys.lists() });
  };

  if (isPending && data === undefined) {
    return <SeedDispatchOverviewSkeleton />;
  }

  return (
    <Tabs
      value={layout}
      onValueChange={(value) => {
        if (isOverviewLayout(value)) setLayout(value);
      }}
      className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="size-4 text-primary" aria-hidden />
          </div>
          <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Seed Dispatches</h1>
        </div>
        <p className="hidden text-sm text-muted-foreground sm:block">
          Manage seed dispatches and track requisitions awaiting fulfillment.
        </p>
      </div>

      {data !== undefined && !isError ? (
        <DispatchSummaryCards
          summary={summary}
          selectedStatus={searchParams.status}
          onSelect={setStatusFilter}
        />
      ) : null}

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="size-5 text-primary" />
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Dispatches</ItemTitle>
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

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-3 sm:p-4">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search dispatches..."
              className="w-full pl-10"
              inputMode="search"
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                table.setGlobalFilter((current: unknown) => {
                  const base = isAdvancedGlobalFilter(current) ? current : emptyGlobalFilter();
                  return { ...base, manualSearch: value };
                });
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={searchParams.status ?? ALL_STATUSES}
              onValueChange={(value) => {
                if (!value) return;
                if (value === ALL_STATUSES) {
                  setStatusFilter(undefined);
                  return;
                }
                if (isSeedDispatchStatus(value)) setStatusFilter(value);
              }}
            >
              <SelectTrigger className="h-11 w-full min-w-0 sm:h-9 sm:w-52">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                {SEED_DISPATCH_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatSeedDispatchStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:shrink-0">
            {layout === 'table' ? (
              <ViewFiltersSheet table={table} onAppliedStatus={setStatusFilter} />
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              asChild
            >
              <Link to="/seed-dispatches/report">
                <FileText data-icon="inline-start" />
                Reports
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0 md:hidden"
              aria-label="Reports"
              asChild
            >
              <Link to="/seed-dispatches/report">
                <FileText />
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 min-w-0 flex-1 gap-1.5 sm:h-9 sm:flex-none sm:w-auto"
              onClick={() => toast.message('Add dispatch coming soon')}
              aria-label="Add dispatch"
            >
              <Plus className="size-4 shrink-0" />
              <span className="hidden sm:inline">Add Dispatch</span>
            </Button>
          </div>
        </div>
      </div>

      {isError && data === undefined ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Truck />
            </EmptyMedia>
            <EmptyTitle>Could not load dispatches</EmptyTitle>
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
      ) : dispatchList.length === 0 ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Truck />
            </EmptyMedia>
            <EmptyTitle>{hasFilters ? 'No matching dispatches' : 'No dispatches yet'}</EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? 'Try a different search or status filter, or clear them.'
                : 'Add a dispatch to populate this overview.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <TabsContent value="table" className="min-w-0">
            <DataTable table={table} />
          </TabsContent>
          <TabsContent value="cards">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pagedDispatches.map((dispatch) => (
                <DispatchCard key={dispatch.id} dispatch={dispatch} />
              ))}
            </div>
          </TabsContent>
        </>
      )}

      {data !== undefined && !isError ? <DispatchPagination table={table} /> : null}
    </Tabs>
  );
}
