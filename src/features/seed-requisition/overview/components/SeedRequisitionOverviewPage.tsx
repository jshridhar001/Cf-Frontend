import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { ClipboardList, Loader2, Plus, RefreshCw, Search, Trash2Icon } from 'lucide-react';
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
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import { useSeedRequisitions } from '@/features/seed-requisition/overview/api/use-seed-requisitions';
import { ApproveRequisitionDialog } from '@/features/seed-requisition/overview/components/approve-requisition-dialog';
import { DeleteAllRequisitionsDialog } from '@/features/seed-requisition/overview/components/delete-all-requisitions-dialog';
import { DeleteRequisitionDialog } from '@/features/seed-requisition/overview/components/delete-requisition-dialog';
import { RejectRequisitionDialog } from '@/features/seed-requisition/overview/components/reject-requisition-dialog';
import { RequisitionCard } from '@/features/seed-requisition/overview/components/requisition-card';
import { RequisitionDrawer } from '@/features/seed-requisition/overview/components/requisition-drawer';
import { RequisitionPagination } from '@/features/seed-requisition/overview/components/requisition-pagination';
import {
  filterAndSortRequisitions,
  isRequisitionSortValue,
  REQUISITION_SORT_OPTIONS,
  type RequisitionSortValue,
} from '@/features/seed-requisition/overview/lib/filter-sort';
import { hasActiveFilters, toListParams } from '@/features/seed-requisition/overview/lib/search';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';
import {
  formatSeedRequisitionStatus,
  isSeedRequisitionStatus,
  SEED_REQUISITION_STATUSES,
} from '@/features/seed-requisition/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';

const DEFAULT_SORT: RequisitionSortValue = 'farmer-asc';
const ALL_STATUSES = 'all';
const overviewRoute = getRouteApi('/_authenticated/seed-requisition/overview');

function SeedRequisitionOverviewSkeleton() {
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

export default function SeedRequisitionOverviewPage() {
  const queryClient = useQueryClient();
  const searchParams = overviewRoute.useSearch();
  const navigate = overviewRoute.useNavigate();
  const listParams = toListParams(searchParams);
  const { data, isPending, isError, error, isFetching } = useSeedRequisitions(listParams);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<RequisitionSortValue>(DEFAULT_SORT);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState<SeedRequisition | null>(null);
  const [deletingRequisition, setDeletingRequisition] = useState<SeedRequisition | null>(null);
  const [approvingRequisition, setApprovingRequisition] = useState<SeedRequisition | null>(null);
  const [rejectingRequisition, setRejectingRequisition] = useState<SeedRequisition | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const requisitionList = data?.items ?? [];
  const total = data?.meta.total ?? requisitionList.length;
  const canDeleteAll = total > 0;
  const hasSearch = search.trim().length > 0;
  const hasFilters = hasSearch || hasActiveFilters(searchParams);

  const visibleRequisitions = useMemo(
    () => filterAndSortRequisitions(requisitionList, search, sort),
    [requisitionList, search, sort],
  );

  const countLabel = `${total} ${total === 1 ? 'requisition' : 'requisitions'}`;

  const refreshList = () => {
    setSearch('');
    setSort(DEFAULT_SORT);
    void queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.lists() });
  };

  if (isPending && data === undefined) {
    return <SeedRequisitionOverviewSkeleton />;
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="size-5 text-primary" />
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{countLabel}</ItemTitle>
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

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-3 sm:p-4">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by farmer, account, or variety"
              className="w-full pl-10"
              inputMode="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
                void navigate({
                  search: (prev) => {
                    if (value === ALL_STATUSES) {
                      const { status: _status, ...rest } = prev;
                      return { ...rest, page: 1 };
                    }
                    if (!isSeedRequisitionStatus(value)) return prev;
                    return { ...prev, page: 1, status: value };
                  },
                });
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
            <Select
              value={sort}
              onValueChange={(value) => {
                if (value && isRequisitionSortValue(value)) setSort(value);
              }}
            >
              <SelectTrigger className="h-11 w-full min-w-0 sm:h-9 sm:w-55">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {REQUISITION_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:shrink-0">
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
      ) : visibleRequisitions.length === 0 ? (
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleRequisitions.map((requisition) => (
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
      )}

      {data !== undefined && !isError ? (
        <RequisitionPagination
          page={searchParams.page}
          pageSize={searchParams.pageSize}
          total={total}
        />
      ) : null}

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
    </div>
  );
}
