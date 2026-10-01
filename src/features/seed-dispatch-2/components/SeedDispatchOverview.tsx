import { useNavigate } from '@tanstack/react-router';
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
} from '@tanstack/react-table';
import { Clock, FileBarChart, Plus, Search, Truck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemGroup, ItemSeparator } from '@/components/ui/item';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useColumnHeadings } from '@/features/seed-dispatch/lib/column-headings';
import {
  getSeedDispatchColumnIds,
  getStoredSeedDispatchColumnState,
} from '@/features/seed-dispatch/lib/column-preferences';
import {
  type AdvancedSdGlobalFilter,
  advancedSdGlobalFilterFn,
  selectedValuesFilterFn,
} from '@/features/seed-dispatch/lib/filter-fns';
import type {
  DispatchableRequisition,
  SeedDispatch,
  SeedDispatchStatus,
} from '@/features/seed-dispatch/types';

import { createAwaitingColumns } from './awaiting-dispatch-columns';
import { createColumns } from './seed-dispatch-columns';
import { SeedDispatchDataTable } from './seed-dispatch-data-table';
import { SeedDispatchSummaryCards } from './seed-dispatch-summary-cards';
import { ViewFiltersSheet } from './view-filters/ViewFiltersSheet';

type StatusTab = 'all' | SeedDispatchStatus | 'awaiting';

const STATUS_TAB_LABELS: Record<StatusTab, string> = {
  all: 'All',
  delivering: 'In Transit',
  delivered: 'Delivered',
  null: 'Null',
  awaiting: 'Awaiting Dispatch',
};

const STATUS_TAB_VALUES = new Set<string>(['delivering', 'delivered', 'null']);

function getDefaultGlobalFilter(manualSearch = ''): AdvancedSdGlobalFilter {
  return {
    logic: 'AND',
    conditions: [],
    manualSearch,
  };
}

function asFilterRow(row: SeedDispatch): Row<SeedDispatch> {
  return {
    original: row,
    getValue: (columnId: string) => {
      if (columnId === 'fromFacility') {
        return row.facilities.map((facility) => facility.facilityName).join(', ');
      }
      if (columnId === 'farmersReceived') {
        return `${row.farmersReceived}/${row.farmersSelected}`;
      }
      return row[columnId as keyof SeedDispatch];
    },
  } as Row<SeedDispatch>;
}

function rowMatchesFilters(
  row: SeedDispatch,
  columnFilters: ColumnFiltersState,
  globalFilter: AdvancedSdGlobalFilter,
  options?: { ignoreStatus?: boolean },
) {
  const filterRow = asFilterRow(row);
  const noopAddMeta = () => undefined;

  if (!advancedSdGlobalFilterFn(filterRow, '', globalFilter, noopAddMeta)) {
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

function getStatusTabFromFilters(
  columnFilters: ColumnFiltersState,
  isAwaitingTab: boolean,
): StatusTab {
  if (isAwaitingTab) return 'awaiting';

  const statusFilter = columnFilters.find((filter) => filter.id === 'status');
  if (!statusFilter || !Array.isArray(statusFilter.value)) return 'all';

  const values = statusFilter.value.map(String);
  if (values.length === 1 && STATUS_TAB_VALUES.has(values[0])) {
    return values[0] as SeedDispatchStatus;
  }

  return 'all';
}

function matchesAwaitingSearch(row: DispatchableRequisition, query: string) {
  if (!query.trim()) return true;

  const haystack = [
    row.farmer.name,
    String(row.farmer.accountNumber),
    row.variety.name,
    row.remarks ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
}

export type SeedDispatchOverviewProps = {
  data: SeedDispatch[];
  awaiting: DispatchableRequisition[];
  onMarkAsNull?: (id: string) => void | Promise<void>;
  onMarkInTransit?: (id: string) => void | Promise<void>;
};

export function SeedDispatchOverview({
  data,
  awaiting,
  onMarkAsNull,
  onMarkInTransit,
}: SeedDispatchOverviewProps) {
  const navigate = useNavigate();
  const { headings, ready } = useColumnHeadings();
  const [isAwaitingTab, setIsAwaitingTab] = useState(false);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'dispatchDate', desc: true }]);
  const [awaitingSorting, setAwaitingSorting] = useState<SortingState>([
    { id: 'approvedDeliveryDate', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [globalFilter, setGlobalFilter] = useState<AdvancedSdGlobalFilter>(() =>
    getDefaultGlobalFilter(),
  );
  const [prefsHydrated, setPrefsHydrated] = useState(false);

  const handleAddDispatch = () => {
    void navigate({ to: '/seed-dispatches/new' });
  };

  const handleViewDispatch = useCallback(
    (dispatch: SeedDispatch) => {
      void navigate({
        to: '/seed-dispatches/$id',
        params: { id: dispatch.id },
      });
    },
    [navigate],
  );

  const columns = useMemo(
    () =>
      createColumns({
        headings,
        onView: handleViewDispatch,
        onMarkAsNull,
        onMarkInTransit,
      }),
    [headings, handleViewDispatch, onMarkAsNull, onMarkInTransit],
  );
  const awaitingColumns = useMemo(() => createAwaitingColumns(), []);
  const columnIds = useMemo(() => getSeedDispatchColumnIds(columns as never), [columns]);

  useEffect(() => {
    if (!ready || prefsHydrated) return;
    const stored = getStoredSeedDispatchColumnState(columnIds);
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

  const filteredAwaitingRows = useMemo(() => {
    return awaiting.filter((row) => matchesAwaitingSearch(row, search));
  }, [awaiting, search]);

  const summaryDispatchRows = useMemo(
    () =>
      data.filter((row) =>
        rowMatchesFilters(row, columnFilters, globalFilter, { ignoreStatus: true }),
      ),
    [data, columnFilters, globalFilter],
  );

  const summaryAwaitingRows = filteredAwaitingRows;

  const tabCounts = useMemo(() => {
    const base = summaryDispatchRows;
    return {
      all: base.length,
      delivering: base.filter((row) => row.status === 'delivering').length,
      delivered: base.filter((row) => row.status === 'delivered').length,
      null: base.filter((row) => row.status === 'null').length,
      awaiting: summaryAwaitingRows.length,
    };
  }, [summaryDispatchRows, summaryAwaitingRows]);

  const statusTab = getStatusTabFromFilters(columnFilters, isAwaitingTab);

  const handleStatusTabChange = (value: string) => {
    const nextTab = value as StatusTab;
    if (nextTab === 'awaiting') {
      setIsAwaitingTab(true);
      setPagination((current) => ({ ...current, pageIndex: 0 }));
      return;
    }

    setIsAwaitingTab(false);
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

  useEffect(() => {
    if (isAwaitingTab) {
      setAwaitingSorting([{ id: 'approvedDeliveryDate', desc: true }]);
    } else {
      setSorting([{ id: 'dispatchDate', desc: true }]);
    }
  }, [isAwaitingTab]);

  /* eslint-disable react-hooks/incompatible-library -- TanStack Table */
  const dispatchTable = useReactTable({
    data,
    columns,
    defaultColumn: { filterFn: selectedValuesFilterFn },
    filterFns: { selectedValues: selectedValuesFilterFn },
    globalFilterFn: advancedSdGlobalFilterFn,
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

  const awaitingTable = useReactTable({
    data: filteredAwaitingRows,
    columns: awaitingColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    state: { sorting: awaitingSorting, pagination },
    onSortingChange: setAwaitingSorting,
    onPaginationChange: setPagination,
  });
  /* eslint-enable react-hooks/incompatible-library */

  const filteredRowCount = isAwaitingTab
    ? awaitingTable.getFilteredRowModel().rows.length
    : dispatchTable.getFilteredRowModel().flatRows.filter((row) => !row.getIsGrouped()).length;
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

  const tableReady = ready && prefsHydrated;

  return (
    <>
      <ItemGroup className="min-w-0">
        <SeedDispatchSummaryCards data={summaryDispatchRows} awaiting={summaryAwaitingRows} />

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
              placeholder={
                isAwaitingTab ? 'Search awaiting requisitions...' : 'Search dispatches...'
              }
              className="w-full pl-8"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {!isAwaitingTab ? <ViewFiltersSheet table={dispatchTable} /> : null}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  toast.message('Get reports', {
                    description: 'Report export is not wired yet.',
                  })
                }
              >
                <FileBarChart className="size-4" />
                Reports
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button type="button" onClick={handleAddDispatch}>
                <Plus className="size-4" />
                Add Dispatch
              </Button>
            </div>
          </div>
        </div>

        <ItemSeparator />

        {!tableReady && !isAwaitingTab ? (
          <div className="text-muted-foreground rounded-md border px-4 py-10 text-center text-sm">
            Loading…
          </div>
        ) : (
          <div className="min-w-0">
            {isAwaitingTab ? (
              <SeedDispatchDataTable
                columns={awaitingColumns}
                table={awaitingTable}
                filteredCount={filteredRowCount}
                emptyTitle="No requisitions awaiting dispatch"
                emptyDescription="Approved requisitions with remaining quantity will appear here."
                emptyIcon={Clock}
                entityLabel="requisitions"
              />
            ) : (
              <SeedDispatchDataTable
                columns={columns}
                table={dispatchTable}
                filteredCount={filteredRowCount}
                isGrouped={isGrouped}
                emptyTitle="No dispatches found"
                emptyDescription="Create a dispatch or adjust filters to see rows."
                emptyIcon={Truck}
                entityLabel="dispatches"
                getRowClassName={(row) =>
                  row.original.status === 'null' ? 'opacity-50 text-muted-foreground' : undefined
                }
              />
            )}
          </div>
        )}
      </ItemGroup>
    </>
  );
}
