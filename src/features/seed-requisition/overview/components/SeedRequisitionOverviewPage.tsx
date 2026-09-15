import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { type PaginationState } from '@tanstack/react-table';
import {
  ClipboardList,
  LayoutGrid,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Trash2Icon,
} from 'lucide-react';
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
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import { useSeedRequisitions } from '@/features/seed-requisition/overview/api/use-seed-requisitions';
import { ApproveRequisitionDialog } from '@/features/seed-requisition/overview/components/approve-requisition-dialog';
import { DataTable } from '@/features/seed-requisition/overview/components/data-table';
import { DeleteAllRequisitionsDialog } from '@/features/seed-requisition/overview/components/delete-all-requisitions-dialog';
import { DeleteRequisitionDialog } from '@/features/seed-requisition/overview/components/delete-requisition-dialog';
import { RejectRequisitionDialog } from '@/features/seed-requisition/overview/components/reject-requisition-dialog';
import { RequisitionCard } from '@/features/seed-requisition/overview/components/requisition-card';
import { RequisitionDrawer } from '@/features/seed-requisition/overview/components/requisition-drawer';
import { RequisitionPagination } from '@/features/seed-requisition/overview/components/requisition-pagination';
import { RequisitionSummaryCards } from '@/features/seed-requisition/overview/components/requisition-summary-cards';
import { useRequisitionsTable } from '@/features/seed-requisition/overview/components/use-requisitions-table';
import { ViewFiltersSheet } from '@/features/seed-requisition/overview/components/view-filters/ViewFiltersSheet';
import {
  emptyGlobalFilter,
  isActiveCondition,
  isAdvancedGlobalFilter,
} from '@/features/seed-requisition/overview/lib/filter-fns';
import { hasActiveFilters, toListParams } from '@/features/seed-requisition/overview/lib/search';
import { summarizeRequisitions } from '@/features/seed-requisition/overview/lib/summary';
import type {
  SeedRequisition,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';
import {
  formatSeedRequisitionStatus,
  isSeedRequisitionStatus,
  SEED_REQUISITION_PAGE_SIZE,
  SEED_REQUISITION_STATUSES,
} from '@/features/seed-requisition/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';

const ALL_STATUSES = 'all';
const overviewRoute = getRouteApi('/_authenticated/seed-requisition/overview');

type OverviewLayout = 'cards' | 'table';
const DESKTOP_LAYOUT_QUERY = '(min-width: 768px)';

function isOverviewLayout(value: string): value is OverviewLayout {
  return value === 'cards' || value === 'table';
}

function getDefaultOverviewLayout(): OverviewLayout {
  if (typeof window === 'undefined') return 'cards';
  return window.matchMedia(DESKTOP_LAYOUT_QUERY).matches ? 'table' : 'cards';
}

function SeedRequisitionOverviewSkeleton() {
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

export default function SeedRequisitionOverviewPage() {
  const queryClient = useQueryClient();
  const searchParams = overviewRoute.useSearch();
  const navigate = overviewRoute.useNavigate();
  const listParams = toListParams(searchParams);
  const { data, isPending, isError, error, isFetching } = useSeedRequisitions(listParams);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState<SeedRequisition | null>(null);
  const [deletingRequisition, setDeletingRequisition] = useState<SeedRequisition | null>(null);
  const [approvingRequisition, setApprovingRequisition] = useState<SeedRequisition | null>(null);
  const [rejectingRequisition, setRejectingRequisition] = useState<SeedRequisition | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [layout, setLayout] = useState<OverviewLayout>(getDefaultOverviewLayout);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: SEED_REQUISITION_PAGE_SIZE,
  });

  const requisitionList = data?.items ?? [];
  const total = data?.meta.total ?? requisitionList.length;
  const canDeleteAll = total > 0;
  const hasSearch = search.trim().length > 0;

  const summary = useMemo(() => summarizeRequisitions(requisitionList), [requisitionList]);

  const table = useRequisitionsTable({
    data: requisitionList,
    pagination,
    onPaginationChange: setPagination,
    status: searchParams.status,
    meta: {
      onEdit: setEditingRequisition,
      onDelete: setDeletingRequisition,
      onApprove: setApprovingRequisition,
      onReject: setRejectingRequisition,
    },
  });

  const pagedRequisitions = table
    .getRowModel()
    .rows.filter((row) => !row.getIsGrouped())
    .map((row) => row.original);
  const tableFiltersActive =
    table.state.columnFilters.length > 0 ||
    table.state.grouping.length > 0 ||
    (isAdvancedGlobalFilter(table.state.globalFilter) &&
      table.state.globalFilter.conditions.some(isActiveCondition));
  const hasFilters = hasSearch || hasActiveFilters(searchParams) || tableFiltersActive;

  const setStatusFilter = (status: SeedRequisitionStatus | undefined) => {
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
    void queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.lists() });
  };

  if (isPending && data === undefined) {
    return <SeedRequisitionOverviewSkeleton />;
  }

  return (
    <Tabs
      value={layout}
      onValueChange={(value) => {
        if (isOverviewLayout(value)) setLayout(value);
      }}
      className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6"
    >
      {data !== undefined && !isError ? (
        <RequisitionSummaryCards
          summary={summary}
          selectedStatus={searchParams.status}
          onSelect={setStatusFilter}
        />
      ) : null}

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="size-5 text-primary" />
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Requisitions</ItemTitle>
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
              placeholder="Search by farmer, account, station, or variety"
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
                if (isSeedRequisitionStatus(value)) setStatusFilter(value);
              }}
            >
              <SelectTrigger className="h-11 w-full min-w-0 sm:h-9 sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                {SEED_REQUISITION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatSeedRequisitionStatus(status)}
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
              variant="destructive"
              size="icon"
              className="size-11 shrink-0 rounded-full md:hidden"
              aria-label="Delete all requisitions"
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
              aria-label="Add requisition"
            >
              <Plus className="size-4 shrink-0" />
              <span className="hidden sm:inline">Add Requisition</span>
            </Button>
          </div>
        </div>
      </div>

      {isError && data === undefined ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>Could not load requisitions</EmptyTitle>
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
      ) : requisitionList.length === 0 ? (
        <Empty className="rounded-xl border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>
              {hasFilters ? 'No matching requisitions' : 'No requisitions yet'}
            </EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? 'Try a different search or status filter, or clear them.'
                : 'Add a requisition to populate this overview.'}
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
              {pagedRequisitions.map((requisition) => (
                <RequisitionCard
                  key={requisition.id}
                  requisition={requisition}
                  onEdit={setEditingRequisition}
                  onDelete={setDeletingRequisition}
                  onApprove={setApprovingRequisition}
                  onReject={setRejectingRequisition}
                />
              ))}
            </div>
          </TabsContent>
        </>
      )}

      {data !== undefined && !isError ? <RequisitionPagination table={table} /> : null}

      <RequisitionDrawer
        requisition={editingRequisition}
        open={createOpen || editingRequisition !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditingRequisition(null);
          }
        }}
      />
      <DeleteRequisitionDialog
        requisition={deletingRequisition}
        open={deletingRequisition !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingRequisition(null);
        }}
      />
      <ApproveRequisitionDialog
        requisition={approvingRequisition}
        open={approvingRequisition !== null}
        onOpenChange={(open) => {
          if (!open) setApprovingRequisition(null);
        }}
      />
      <RejectRequisitionDialog
        requisition={rejectingRequisition}
        open={rejectingRequisition !== null}
        onOpenChange={(open) => {
          if (!open) setRejectingRequisition(null);
        }}
      />
      <DeleteAllRequisitionsDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        count={total}
      />
    </Tabs>
  );
}
