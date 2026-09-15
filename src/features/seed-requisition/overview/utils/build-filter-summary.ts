import {
  ADVANCED_FILTER_OPERATORS,
  isActiveCondition,
  isAdvancedGlobalFilter,
} from '@/features/seed-requisition/overview/lib/filter-fns';
import {
  getColumnExportLabel,
  type RequisitionsExportTable,
} from '@/features/seed-requisition/overview/utils/export-cell-value';

function formatFilterValues(
  table: RequisitionsExportTable,
  columnId: string,
  values: unknown[],
): string {
  const column = table.getColumn(columnId);
  const formatter = column?.columnDef.meta?.filterValueFormatter;
  return values
    .map((value) => {
      if (formatter) return formatter(value);
      if (value == null || value === '') return 'Blank';
      return String(value);
    })
    .join(', ');
}

function operatorLabel(operator: string): string {
  return ADVANCED_FILTER_OPERATORS.find((item) => item.value === operator)?.label ?? operator;
}

export function buildFilterSummaryLines(table: RequisitionsExportTable): string[] {
  const lines: string[] = [];
  const { columnFilters, globalFilter, grouping, sorting } = table.store.state;

  for (const filter of columnFilters) {
    if (!Array.isArray(filter.value) || filter.value.length === 0) continue;
    const column = table.getColumn(filter.id);
    const label = column ? getColumnExportLabel(column) : filter.id;
    lines.push(`${label}: ${formatFilterValues(table, filter.id, filter.value)}`);
  }

  if (isAdvancedGlobalFilter(globalFilter)) {
    const search = globalFilter.manualSearch?.trim();
    if (search) {
      lines.push(`Search: “${search}”`);
    }

    const active = globalFilter.conditions.filter(isActiveCondition);
    if (active.length > 0) {
      const conditionText = active
        .map((condition) => {
          const column = table.getColumn(condition.columnId);
          const label = column ? getColumnExportLabel(column) : condition.columnId;
          const op = operatorLabel(condition.operator);
          if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
            return `${label} ${op.toLowerCase()}`;
          }
          return `${label} ${op.toLowerCase()} “${condition.value.trim()}”`;
        })
        .join(globalFilter.logic === 'OR' ? ' OR ' : ' AND ');
      lines.push(`Advanced: ${conditionText}`);
    }
  }

  if (grouping.length > 0) {
    const groupLabels = grouping.map((columnId) => {
      const column = table.getColumn(columnId);
      return column ? getColumnExportLabel(column) : columnId;
    });
    lines.push(`Grouped by: ${groupLabels.join(' → ')}`);
  }

  if (sorting.length > 0) {
    const sortLabels = sorting.map((sort) => {
      const column = table.getColumn(sort.id);
      const label = column ? getColumnExportLabel(column) : sort.id;
      return `${label} (${sort.desc ? 'desc' : 'asc'})`;
    });
    lines.push(`Sorted by: ${sortLabels.join(', ')}`);
  }

  return lines;
}
