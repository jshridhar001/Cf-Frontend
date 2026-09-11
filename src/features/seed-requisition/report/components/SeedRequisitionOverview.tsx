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
import { EditSeedRequisitionSheet } from './edit-seed-requisition-sheet';
import { RejectSeedRequisitionDialog } from './reject-seed-requisition-dialog';
import { createColumns } from './seed-requisition-columns';
import { SeedRequisitionDataTable } from './seed-requisition-data-table';
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
  const [editingRequisition, setEditingRequisition] = useState<SeedRequisitionRow | null>(null);
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

  const handleEditRequisition = useCallback((requisition: SeedRequisitionRow) => {
    if (requisition.status !== 'pending') return;
    setEditingRequisition(requisition);
  }, []);

  const columns = useMemo(
    () =>
      createColumns(headings, {
        onView: handleViewRequisition,
        onEdit: handleEditRequisition,
        onApprove: setApprovingRequisition,
        onReject: setRejectingRequisition,
      }),
    [headings, handleViewRequisition, handleEditRequisition],
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

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <Button
              type="button"
              size="icon"
              className="min-h-11 min-w-11 md:hidden"
              aria-label="Add seed requisition"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus />
            </Button>
            <Button
              type="button"
              className="hidden md:inline-flex"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus data-icon="inline-start" />
              Add Seed Requisition
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="min-h-11 min-w-11 md:hidden"
              aria-label="Delete all seed requisitions"
              disabled={rows.length === 0 || isPending}
              onClick={() => setIsDeleteAllOpen(true)}
            >
              <Trash2 />
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="hidden md:inline-flex"
              disabled={rows.length === 0 || isPending}
              onClick={() => setIsDeleteAllOpen(true)}
            >
              <Trash2 data-icon="inline-start" />
              Delete All
            </Button>
            <ViewFiltersSheet table={table} />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11 md:hidden"
              aria-label="Refresh"
              onClick={handleRefresh}
            >
              <RefreshCw />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hidden md:inline-flex"
              onClick={handleRefresh}
            >
              <RefreshCw data-icon="inline-start" />
              Refresh
            </Button>
          </div>
        </div>

        <ItemSeparator />

        {!tableReady ? (
          <div className="text-muted-foreground rounded-md border px-4 py-10 text-center text-sm">
            Loading…
          </div>
        ) : (
          <div className="min-w-0">
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
        )}
      </ItemGroup>

      <CreateSeedRequisitionSheet open={isAddOpen} onOpenChange={setIsAddOpen} />

      <EditSeedRequisitionSheet
        requisition={editingRequisition}
        onOpenChange={(open) => {
          if (!open) setEditingRequisition(null);
        }}
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
