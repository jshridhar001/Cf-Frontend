import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnVisibilityState,
  type ExpandedState,
  type GroupingState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  type FarmersTableMeta,
  farmerColumns,
  renderUniqueCount,
} from '@/features/farmers/overview/components/farmer-columns';
import { getColumnPreferences } from '@/features/farmers/overview/lib/column-preferences';
import {
  type AdvancedGlobalFilter,
  emptyGlobalFilter,
} from '@/features/farmers/overview/lib/filter-fns';
import { farmerTableFeatures } from '@/features/farmers/overview/lib/table-features';
import type { Farmer } from '@/features/farmers/overview/types';

export function useFarmersTable({ data, meta }: { data: Farmer[]; meta: FarmersTableMeta }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    () => getColumnPreferences().columnVisibility,
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    () => getColumnPreferences().columnOrder,
  );
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState<AdvancedGlobalFilter>(() => emptyGlobalFilter());

  return useTable({
    features: farmerTableFeatures,
    data,
    columns: farmerColumns,
    getRowId: (row) => row.id,
    defaultColumn: {
      filterFn: 'selectedValues',
      aggregationFn: 'uniqueCount',
      aggregatedCell: renderUniqueCount,
    },
    globalFilterFn: 'advanced',
    groupedColumnMode: 'reorder',
    autoResetExpanded: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    state: {
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

export type FarmersTable = ReturnType<typeof useFarmersTable>;
