import type { FilterFn, Row } from '@tanstack/react-table';

import type { SeedDispatch } from '@/features/seed-dispatch/types';

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

export type SeedDispatchFilterableColumnId =
  | 'status'
  | 'farmersReceived'
  | 'dispatchDate'
  | 'deliveredOn'
  | 'fromFacility'
  | 'destination'
  | 'remarks'
  | 'netWeightKg'
  | 'truckNumber'
  | 'driverMobile';

export type AdvancedFilterCondition = {
  id: string;
  columnId: SeedDispatchFilterableColumnId;
  operator: AdvancedFilterOperator;
  value: string;
};

export type AdvancedSdGlobalFilter = {
  logic: AdvancedFilterLogic;
  conditions: AdvancedFilterCondition[];
  manualSearch?: string;
};

export function getSdFilterValueKey(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export const selectedValuesFilterFn: FilterFn<SeedDispatch> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue)) return true;

  const selectedValues = new Set(filterValue.map(String));
  const rowValueKey = getSdFilterValueKey(row.getValue(columnId));

  return selectedValues.has(rowValueKey);
};

selectedValuesFilterFn.autoRemove = (filterValue) => filterValue == null;

function isAdvancedSdGlobalFilter(value: unknown): value is AdvancedSdGlobalFilter {
  return (
    typeof value === 'object' &&
    value != null &&
    'logic' in value &&
    'conditions' in value &&
    Array.isArray((value as AdvancedSdGlobalFilter).conditions)
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

function evaluateCondition(row: Row<SeedDispatch>, condition: AdvancedFilterCondition) {
  const rawValue = row.getValue(condition.columnId);

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

export const advancedSdGlobalFilterFn: FilterFn<SeedDispatch> = (row, _columnId, filterValue) => {
  if (!isAdvancedSdGlobalFilter(filterValue)) return true;

  const manualSearch = filterValue.manualSearch?.trim();
  if (manualSearch) {
    const q = normalizeText(manualSearch);
    const haystack = [
      row.original.destination,
      row.original.remarks,
      row.original.truckNumber,
      row.original.driverMobile,
      row.original.status,
      row.original.dispatchDate,
      row.original.deliveredOn,
      String(row.original.netWeightKg),
      String(row.original.farmersReceived),
      String(row.original.farmersSelected),
      ...row.original.facilities.map((facility) => facility.facilityName),
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
    ? activeConditions.every((condition) => evaluateCondition(row, condition))
    : activeConditions.some((condition) => evaluateCondition(row, condition));
};

advancedSdGlobalFilterFn.autoRemove = (filterValue) =>
  !isAdvancedSdGlobalFilter(filterValue) ||
  ((filterValue.manualSearch?.trim().length ?? 0) === 0 &&
    filterValue.conditions.every(
      (condition) =>
        condition.operator !== 'isEmpty' &&
        condition.operator !== 'isNotEmpty' &&
        condition.value.trim().length === 0,
    ));
