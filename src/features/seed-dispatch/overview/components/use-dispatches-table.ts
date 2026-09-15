import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnVisibilityState,
  type ExpandedState,
  type GroupingState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import {
  columns,
  type DispatchesTableMeta,
} from '@/features/seed-dispatch/overview/components/columns';
import { features } from '@/features/seed-dispatch/overview/components/data-table-features';
import {
  DEFAULT_COLUMN_PREFERENCES,
  loadColumnPreferences,
} from '@/features/seed-dispatch/overview/lib/column-preferences';
import {
  type AdvancedGlobalFilter,
  emptyGlobalFilter,
} from '@/features/seed-dispatch/overview/lib/filter-fns';
import type {
  SeedDispatch,
  SeedDispatchStatus,
} from '@/features/seed-dispatch/overview/types';

function statusColumnFilters(
  prev: ColumnFiltersState,
  status: SeedDispatchStatus | undefined,
): ColumnFiltersState {
  const current = prev.find((filter) => filter.id === 'status')?.value;
  if (!status && Array.isArray(current) && current.length > 1) return prev;

  const withoutStatus = prev.filter((filter) => filter.id !== 'status');
  if (!status) return withoutStatus;
  if (Array.isArray(current) && current.length === 1 && current[0] === status) return prev;
  return [...withoutStatus, { id: 'status', value: [status] }];
}

export function useDispatchesTable({
  data,
  pagination,
  onPaginationChange,
  meta,
  status,
}: {
  data: SeedDispatch[];
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  meta?: DispatchesTableMeta;
  status?: SeedDispatchStatus;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'dispatchDate', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    status ? [{ id: 'status', value: [status] }] : [],
  );
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    DEFAULT_COLUMN_PREFERENCES.columnVisibility,
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    DEFAULT_COLUMN_PREFERENCES.columnOrder,
  );
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState<AdvancedGlobalFilter>(() => emptyGlobalFilter());

  useEffect(() => {
    const stored = loadColumnPreferences();
    if (!stored) return;
    setColumnVisibility(stored.columnVisibility);
    setColumnOrder(stored.columnOrder);
  }, []);

  useEffect(() => {
    setColumnFilters((prev) => statusColumnFilters(prev, status));
  }, [status]);

  return useTable({
    features,
    data,
    columns,
    getRowId: (row) => row.id,
    defaultColumn: {
      filterFn: 'selectedValues',
    },
    globalFilterFn: 'advanced',
    groupedColumnMode: 'reorder',
    paginateExpandedRows: false,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    filterFromLeafRows: true,
    onPaginationChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      grouping,
      expanded,
      globalFilter,
    },
    meta,
  });
}

export type DispatchesTable = ReturnType<typeof useDispatchesTable>;
