import type { ColumnFiltersState } from '@tanstack/react-table';
import type { DispatchColumnMeta } from '@/features/seed-dispatch/overview/components/data-table-features';
import { getFilterValueKey } from '@/features/seed-dispatch/overview/lib/filter-fns';

export const ACTIONS_COLUMN_ID = 'actions';

type LabeledColumn = {
  id: string;
  columnDef: {
    meta?: DispatchColumnMeta;
  };
};

export function isActionsColumn(columnId: string) {
  return columnId === ACTIONS_COLUMN_ID;
}

export function getColumnFilterLabel(column: LabeledColumn): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

export function formatFacetLabel(column: LabeledColumn, value: unknown): string {
  const formatter = column.columnDef.meta?.filterValueFormatter;
  if (formatter) return formatter(value);
  const key = getFilterValueKey(value);
  return key === '' ? 'Blank' : key;
}

export function getSelectedFilterKeys(
  columnFilters: ColumnFiltersState,
  columnId: string,
): string[] | null {
  const match = columnFilters.find((filter) => filter.id === columnId);
  if (!match) return null;
  return Array.isArray(match.value) ? match.value.map(String) : null;
}

export function setColumnFilterValue(
  columnFilters: ColumnFiltersState,
  columnId: string,
  value: string[] | null,
): ColumnFiltersState {
  const without = columnFilters.filter((filter) => filter.id !== columnId);
  if (value == null) return without;
  return [...without, { id: columnId, value }];
}

export function moveItem<T>(ids: T[], from: number, to: number): T[] {
  const next = [...ids];
  const [removed] = next.splice(from, 1);
  if (removed === undefined) return ids;
  next.splice(to, 0, removed);
  return next;
}

export function orderedColumnIds(order: string[], leafIds: string[]): string[] {
  const remaining = new Set(leafIds);
  const ordered = order.filter((id) => remaining.delete(id));
  return [...ordered, ...leafIds.filter((id) => remaining.has(id))];
}
