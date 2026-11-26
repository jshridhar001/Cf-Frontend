import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnVisibilityState,
  type ExpandedState,
  type GroupingState,
  type OnChangeFn,
  type PaginationState,
  useTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { features } from '@/features/task-manager/components/data-table-features';
import { createTaskColumns } from '@/features/task-manager/components/task-columns';
import { getColumnPreferences } from '@/features/task-manager/lib/column-preferences';
import { TASK_PAGE_SIZE, type TaskListItem } from '@/features/task-manager/lib/task-view';

export function useTasksTable({
  data,
  showOfficer,
}: {
  data: TaskListItem[];
  showOfficer: boolean;
}) {
  const columns = useMemo(() => createTaskColumns(showOfficer), [showOfficer]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TASK_PAGE_SIZE,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    () => getColumnPreferences().columnVisibility,
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    () => getColumnPreferences().columnOrder,
  );
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  return useTable({
    features,
    data,
    columns,
    getRowId: (row) => row.task.id,
    defaultColumn: {
      filterFn: 'selectedValues',
    },
    globalFilterFn: 'taskSearch',
    groupedColumnMode: 'reorder',
    paginateExpandedRows: false,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    filterFromLeafRows: true,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter as OnChangeFn<string>,
    state: {
      pagination,
      columnFilters,
      columnVisibility,
      columnOrder,
      grouping,
      expanded,
      globalFilter,
    },
  });
}

export type TasksTable = ReturnType<typeof useTasksTable>;
