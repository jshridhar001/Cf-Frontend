import type { FilterFn, LegacyFeatures } from '@/features/seed-requisition/report/lib/react-table';
import type { SeedRequisitionRow } from '../types';

export type SelectedValuesFilterValue = string[];
export type AdvancedFilterLogic = 'AND' | 'OR';
export type AdvancedFilterOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty';

export type SeedRequisitionFilterableColumnId =
  | 'farmer'
  | 'variety'
  | 'status'
  | 'requisitionDate'
  | 'requestedDeliveryDate'
  | 'approvedDelivery'
  | 'rejectionDate'
  | 'remarks'
  | 'acres'
  | 'seedBags';

export type AdvancedFilterCondition = {
  id: string;
  columnId: SeedRequisitionFilterableColumnId;
  operator: AdvancedFilterOperator;
  value: string;
};

export type AdvancedSrGlobalFilter = {
  logic: AdvancedFilterLogic;
  conditions: AdvancedFilterCondition[];
  manualSearch?: string;
};

export function getSrFilterValueKey(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export const selectedValuesFilterFn: FilterFn<LegacyFeatures, SeedRequisitionRow> = (
  row,
  columnId,
  filterValue,
) => {
  if (!Array.isArray(filterValue)) return true;

  const selectedValues = new Set(filterValue.map(String));
  const rowValueKey = getSrFilterValueKey(row.getValue(columnId));

  return selectedValues.has(rowValueKey);
};

selectedValuesFilterFn.autoRemove = (filterValue) => filterValue == null;

function isAdvancedSrGlobalFilter(value: unknown): value is AdvancedSrGlobalFilter {
  return (
    typeof value === 'object' &&
    value != null &&
    'logic' in value &&
    'conditions' in value &&
    Array.isArray((value as AdvancedSrGlobalFilter).conditions)
  );
}

function normalizeText(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().toLowerCase();
  }

  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function evaluateCondition(row: SeedRequisitionRow, condition: AdvancedFilterCondition) {
  const rawValue = row[condition.columnId];

  if (condition.operator === 'isEmpty') {
    return rawValue == null || String(rawValue).trim().length === 0;
  }

  if (condition.operator === 'isNotEmpty') {
    return rawValue != null && String(rawValue).trim().length > 0;
  }

  const filterValue = condition.value.trim();
  if (filterValue.length === 0) return true;

  const rowText = normalizeText(rawValue);
  const filterText = normalizeText(filterValue);

  switch (condition.operator) {
    case 'contains':
      return rowText.includes(filterText);
    case 'notContains':
      return !rowText.includes(filterText);
    case 'equals':
      return rowText === filterText;
    case 'notEquals':
      return rowText !== filterText;
    case 'startsWith':
      return rowText.startsWith(filterText);
    case 'endsWith':
      return rowText.endsWith(filterText);
    default:
      return true;
  }
}

export const advancedSrGlobalFilterFn: FilterFn<LegacyFeatures, SeedRequisitionRow> = (
  row,
  _columnId,
  filterValue,
) => {
  if (!isAdvancedSrGlobalFilter(filterValue)) return true;

  const manualSearch = filterValue.manualSearch?.trim();
  if (manualSearch) {
    const q = normalizeText(manualSearch);
    const haystack = [
      row.original.farmer,
      row.original.variety,
      row.original.status,
      row.original.remarks,
      row.original.requisitionDate,
      row.original.requestedDeliveryDate,
      row.original.approvedDelivery,
      row.original.rejectionDate,
      String(row.original.acres),
      String(row.original.seedBags),
      row.original.id,
    ]
      .map(normalizeText)
      .join(' ');

    if (!haystack.includes(q)) return false;
  }

  const activeConditions = filterValue.conditions.filter((condition) => {
    if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
      return true;
    }

    return condition.value.trim().length > 0;
  });

  if (activeConditions.length === 0) return true;

  return filterValue.logic === 'AND'
    ? activeConditions.every((condition) => evaluateCondition(row.original, condition))
    : activeConditions.some((condition) => evaluateCondition(row.original, condition));
};

advancedSrGlobalFilterFn.autoRemove = (filterValue) =>
  !isAdvancedSrGlobalFilter(filterValue) ||
  ((filterValue.manualSearch?.trim().length ?? 0) === 0 &&
    filterValue.conditions.every(
      (condition) =>
        condition.operator !== 'isEmpty' &&
        condition.operator !== 'isNotEmpty' &&
        condition.value.trim().length === 0,
    ));
