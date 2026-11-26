import type { ColumnFiltersState, ColumnOrderState } from '@tanstack/react-table';
import type { TaskColumnMeta } from '@/features/task-manager/components/data-table-features';
import { getFilterValueKey } from '@/features/task-manager/lib/selected-values-filter';

type LabeledColumn = {
  id: string;
  columnDef: {
    meta?: TaskColumnMeta;
  };
};

export function getColumnFilterLabel(column: LabeledColumn): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

export function formatFacetLabel(value: unknown): string {
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

export function orderedColumnIds(order: ColumnOrderState, leafIds: string[]): string[] {
  const remaining = new Set(leafIds);
  const ordered = order.filter((id) => remaining.delete(id));
  return [...ordered, ...leafIds.filter((id) => remaining.has(id))];
}
