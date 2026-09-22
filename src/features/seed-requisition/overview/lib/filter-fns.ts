import { constructFilterFn } from '@tanstack/react-table';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';
import { getRequisitionPlaceLabel } from '@/features/seed-requisition/overview/types';

export type AdvancedFilterOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty';

export type AdvancedFilterCondition = {
  id: string;
  columnId: string;
  operator: AdvancedFilterOperator;
  value: string;
};

export type AdvancedGlobalFilter = {
  logic: 'AND' | 'OR';
  conditions: AdvancedFilterCondition[];
  manualSearch?: string;
};

export const ADVANCED_FILTER_OPERATORS: Array<{
  value: AdvancedFilterOperator;
  label: string;
}> = [
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Does not equal' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'isEmpty', label: 'Is blank' },
  { value: 'isNotEmpty', label: 'Is not blank' },
];

export function emptyGlobalFilter(manualSearch = ''): AdvancedGlobalFilter {
  return { logic: 'AND', conditions: [], manualSearch };
}

export function isAdvancedGlobalFilter(value: unknown): value is AdvancedGlobalFilter {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AdvancedGlobalFilter>;
  return (
    (candidate.logic === 'AND' || candidate.logic === 'OR') && Array.isArray(candidate.conditions)
  );
}

export function operatorRequiresValue(operator: AdvancedFilterOperator) {
  return operator !== 'isEmpty' && operator !== 'isNotEmpty';
}

export function isActiveCondition(condition: AdvancedFilterCondition) {
  if (!operatorRequiresValue(condition.operator)) return true;
  return condition.value.trim().length > 0;
}

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

function normalizeCompareValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().toLowerCase();
  return String(value).toLowerCase();
}

function evaluateCondition(raw: unknown, condition: AdvancedFilterCondition): boolean {
  const text = normalizeCompareValue(raw);
  const query = condition.value.trim().toLowerCase();

  switch (condition.operator) {
    case 'contains':
      return text.includes(query);
    case 'notContains':
      return !text.includes(query);
    case 'equals':
      return text === query;
    case 'notEquals':
      return text !== query;
    case 'startsWith':
      return text.startsWith(query);
    case 'endsWith':
      return text.endsWith(query);
    case 'isEmpty':
      return text.length === 0;
    case 'isNotEmpty':
      return text.length > 0;
  }
}

function searchHaystack(requisition: SeedRequisition): string {
  return [
    requisition.farmer?.name,
    requisition.farmer?.accountNumber,
    getRequisitionPlaceLabel(requisition.farmer),
    requisition.variety?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export const advancedGlobalFilterFn = constructFilterFn({
  filter: (_dataValue, filterValue, row) => {
    if (!isAdvancedGlobalFilter(filterValue)) return true;

    const requisition = row.original as SeedRequisition;
    const query = filterValue.manualSearch?.trim().toLowerCase() ?? '';
    if (query && !searchHaystack(requisition).includes(query)) return false;

    const active = filterValue.conditions.filter(isActiveCondition);
    if (active.length === 0) return true;

    const results = active.map((condition) =>
      evaluateCondition(row.getValue(condition.columnId), condition),
    );
    return filterValue.logic === 'OR' ? results.some(Boolean) : results.every(Boolean);
  },
  autoRemove: (filterValue) =>
    !isAdvancedGlobalFilter(filterValue) ||
    (!filterValue.manualSearch?.trim() &&
      filterValue.conditions.every(
        (condition) => operatorRequiresValue(condition.operator) && !condition.value.trim(),
      )),
});
