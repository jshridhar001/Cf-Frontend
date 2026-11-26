import { constructFilterFn } from '@tanstack/react-table';
import { matchesTaskSearch, type TaskListItem } from '@/features/task-manager/lib/task-view';

export function getFilterValueKey(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export const selectedValuesFilterFn = constructFilterFn({
  filter: (dataValue, filterValue) => {
    if (!Array.isArray(filterValue)) return true;
    return new Set(filterValue.map(String)).has(getFilterValueKey(dataValue));
  },
  autoRemove: (filterValue) => filterValue == null,
});

export const taskSearchFilterFn = constructFilterFn({
  filter: (_dataValue, filterValue, row) => {
    if (typeof filterValue !== 'string') return true;
    return matchesTaskSearch(row.original as TaskListItem, filterValue);
  },
  autoRemove: (filterValue) => typeof filterValue !== 'string' || filterValue.trim() === '',
});
