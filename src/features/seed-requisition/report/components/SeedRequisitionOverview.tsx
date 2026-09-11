import { useNavigate } from '@tanstack/react-router';
import { Loader2, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemGroup, ItemSeparator } from '@/components/ui/item';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useColumnHeadings } from '@/features/seed-requisition/report/lib/column-headings';
import {
  getSeedRequisitionColumnIds,
  getStoredSeedRequisitionColumnState,
} from '@/features/seed-requisition/report/lib/column-preferences';
import {
  type AdvancedSrGlobalFilter,
  advancedSrGlobalFilterFn,
  selectedValuesFilterFn,
} from '@/features/seed-requisition/report/lib/filter-fns';
import type { SeedRequisitionFormOptions } from '@/features/seed-requisition/report/lib/form-options';
import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type ExpandedState,
  type GroupingState,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@/features/seed-requisition/report/lib/react-table';
import type {
  SeedRequisitionRow,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/report/types';

import { ApproveSeedRequisitionDialog } from './approve-seed-requisition-dialog';
import { CreateSeedRequisitionSheet } from './create-seed-requisition-sheet';
import { RejectSeedRequisitionDialog } from './reject-seed-requisition-dialog';
import { createColumns } from './seed-requisition-columns';
import { SeedRequisitionDataTable } from './seed-requisition-data-table';
import { SeedRequisitionMobileList } from './seed-requisition-mobile-list';
import { SeedRequisitionSummaryCards } from './seed-requisition-summary-cards';
import { ViewFiltersSheet } from './view-filters/ViewFiltersSheet';

type StatusTab = 'all' | SeedRequisitionStatus;

const STATUS_TAB_LABELS: Record<StatusTab, string> = {
  all: 'All',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_TAB_VALUES = new Set<string>(Object.keys(STATUS_TAB_LABELS));

export type SeedRequisitionOverviewProps = {
  data: SeedRequisitionRow[];
  formOptions: SeedRequisitionFormOptions;
  onRefresh?: () => void;
  onDeleteAll?: () => Promise<void> | void;
};

function getDefaultGlobalFilter(manualSearch = ''): AdvancedSrGlobalFilter {
  return {
    logic: 'AND',
    conditions: [],
    manualSearch,
  };
}

function asFilterRow(row: SeedRequisitionRow): Row<SeedRequisitionRow> {
  return {
    original: row,
    getValue: (columnId: string) => row[columnId as keyof SeedRequisitionRow],
  } as Row<SeedRequisitionRow>;
}

function rowMatchesFilters(
  row: SeedRequisitionRow,
  columnFilters: ColumnFiltersState,
  globalFilter: AdvancedSrGlobalFilter,
  options?: { ignoreStatus?: boolean },
) {
  const filterRow = asFilterRow(row);
  const noopAddMeta = () => undefined;

  if (!advancedSrGlobalFilterFn(filterRow, '', globalFilter, noopAddMeta)) {
    return false;
  }

  for (const filter of columnFilters) {
    if (options?.ignoreStatus && filter.id === 'status') continue;
    if (!selectedValuesFilterFn(filterRow, filter.id, filter.value, noopAddMeta)) {
      return false;
    }
  }

  return true;
}

function getStatusTabFromFilters(columnFilters: ColumnFiltersState): StatusTab {
  const statusFilter = columnFilters.find((filter) => filter.id === 'status');
  if (!statusFilter || !Array.isArray(statusFilter.value)) return 'all';

  const values = statusFilter.value.map(String);
  if (values.length === 1 && STATUS_TAB_VALUES.has(values[0]) && values[0] !== 'all') {
    return values[0] as SeedRequisitionStatus;
  }

  return 'all';
}

export function SeedRequisitionOverview({
  data,
  formOptions,
  onRefresh,
  onDeleteAll,
}: SeedRequisitionOverviewProps) {
  const navigate = useNavigate();
  const { headings, ready } = useColumnHeadings();
  const [rows, setRows] = useState(data);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [approvingRequisition, setApprovingRequisition] = useState<SeedRequisitionRow | null>(null);
  const [rejectingRequisition, setRejectingRequisition] = useState<SeedRequisitionRow | null>(null);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'requisitionDate', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState<AdvancedSrGlobalFilter>(() =>
    getDefaultGlobalFilter(),
  );
  const [prefsHydrated, setPrefsHydrated] = useState(false);

  const handleDeleteAll = () => {
    startTransition(async () => {
      try {
        await onDeleteAll?.();
        setIsDeleteAllOpen(false);
      } catch {
        // Error toast is handled by the mutation.
      }
    });
  };

  const handleViewRequisition = useCallback(
    (requisition: SeedRequisitionRow) => {
      void navigate({
        to: '/seed-requisition/$id',
        params: { id: requisition.id },
      });
    },
    [navigate],
  );

  const columns = useMemo(
    () =>
      createColumns(headings, {
        onView: handleViewRequisition,
        onApprove: setApprovingRequisition,
        onReject: setRejectingRequisition,
      }),
    [headings, handleViewRequisition],
  );

  const columnIds = useMemo(() => getSeedRequisitionColumnIds(columns as never), [columns]);

  useEffect(() => {
    if (!ready || prefsHydrated) return;
    const stored = getStoredSeedRequisitionColumnState(columnIds);
    const nextVisibility = { ...stored.columnVisibility };
    for (const columnId of columnIds) {
      if (columnId === 'remarks' || columnId === 'actions') {
        delete nextVisibility[columnId];
      }
    }
    setColumnVisibility(nextVisibility);
    setColumnOrder(stored.columnOrder);
    setPrefsHydrated(true);
  }, [ready, prefsHydrated, columnIds]);

  useEffect(() => {
    setRows(data);
  }, [data]);

  /* eslint-disable react-hooks/incompatible-library -- TanStack Table */
  const table = useReactTable({
    data: rows,
    columns,
    defaultColumn: { filterFn: selectedValuesFilterFn },
    filterFns: { selectedValues: selectedValuesFilterFn },
    globalFilterFn: advancedSrGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.id,
    enableSortingRemoval: true,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    paginateExpandedRows: false,
    groupedColumnMode: 'reorder',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      grouping,
      expanded,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
  });
  /* eslint-enable react-hooks/incompatible-library */

  const tableRows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();
  const filteredRowCount = table
    .getFilteredRowModel()
    .flatRows.filter((row) => !row.getIsGrouped()).length;
  const isGrouped = grouping.length > 0;

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(filteredRowCount / pagination.pageSize));
    if (pagination.pageIndex > pageCount - 1) {
      setPagination((current) => ({
        ...current,
        pageIndex: Math.max(0, pageCount - 1),
      }));
    }
  }, [filteredRowCount, pagination.pageIndex, pagination.pageSize]);

  const statusTab = getStatusTabFromFilters(columnFilters);

  const handleStatusTabChange = (value: string) => {
    const nextTab = value as StatusTab;
    setColumnFilters((current) => {
      const withoutStatus = current.filter((filter) => filter.id !== 'status');
      if (nextTab === 'all') return withoutStatus;
      return [...withoutStatus, { id: 'status', value: [nextTab] }];
    });
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setGlobalFilter((current) => ({
      ...current,
      logic: current.logic ?? 'AND',
      conditions: current.conditions ?? [],
      manualSearch: value,
    }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const summaryRows = useMemo(
    () =>
      rows.filter((row) =>
        rowMatchesFilters(row, columnFilters, globalFilter, { ignoreStatus: true }),
      ),
    [rows, columnFilters, globalFilter],
  );

  const tabCounts = useMemo(() => {
    const base = summaryRows;
    return {
      all: base.length,
      pending: base.filter((row) => row.status === 'pending').length,
      approved: base.filter((row) => row.status === 'approved').length,
      rejected: base.filter((row) => row.status === 'rejected').length,
    };
  }, [summaryRows]);

  const mobileRows = table
    .getFilteredRowModel()
    .flatRows.filter((row) => !row.getIsGrouped())
    .map((row) => row.original);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
    toast.success('Refreshed', {
      description: 'Seed requisitions reloaded.',
    });
  }, [onRefresh]);

  const tableReady = ready && prefsHydrated;

  return (
    <>
      <ItemGroup className="min-w-0">
        <SeedRequisitionSummaryCards data={summaryRows} />

        <ItemSeparator />

        <Tabs value={statusTab} onValueChange={handleStatusTabChange}>
          <TabsList variant="line" className="w-full justify-start overflow-x-auto sm:w-fit">
            {(Object.keys(STATUS_TAB_LABELS) as StatusTab[]).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="shrink-0">
                {STATUS_TAB_LABELS[tab]} ({tabCounts[tab]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ItemSeparator />

        <div className="space-y-3">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search requisitions..."
              className="w-full pl-8"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <ViewFiltersSheet table={table} />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button type="button" onClick={() => setIsAddOpen(true)}>
                <Plus className="size-4" />
                Add Seed Requisition
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={rows.length === 0 || isPending}
                onClick={() => setIsDeleteAllOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete All
              </Button>
              <Button type="button" variant="outline" onClick={handleRefresh}>
                <RefreshCw className="size-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <ItemSeparator />

        {!tableReady ? (
          <div className="text-muted-foreground rounded-md border px-4 py-10 text-center text-sm">
            Loading…
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <SeedRequisitionMobileList
                data={mobileRows}
                headings={headings}
                onView={handleViewRequisition}
              />
            </div>
            <div className="hidden min-w-0 md:block">
              <SeedRequisitionDataTable
                columns={columns}
                table={table}
                rows={tableRows}
                headerGroups={headerGroups}
                filteredCount={filteredRowCount}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                isGrouped={isGrouped}
                emptyTitle="No requisitions found."
                entityLabel="requisitions"
              />
            </div>
          </>
        )}
      </ItemGroup>

      <CreateSeedRequisitionSheet
        open={isAddOpen}
        options={formOptions}
        onOpenChange={setIsAddOpen}
      />

      <ApproveSeedRequisitionDialog
        requisition={approvingRequisition}
        onOpenChange={(open) => {
          if (!open) setApprovingRequisition(null);
        }}
      />

      <RejectSeedRequisitionDialog
        requisition={rejectingRequisition}
        onOpenChange={(open) => {
          if (!open) setRejectingRequisition(null);
        }}
      />

      <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete all seed requisitions?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes all {rows.length} seed requisitions. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                handleDeleteAll();
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete all'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
