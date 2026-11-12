import type { Column, Row, Table } from '@tanstack/react-table';
import {
  formatDispatchPercent,
  formatGroupDispatchPercent,
  groupQuantityLines,
  isNothingDispatched,
  type QuantityKind,
  type QuantityLines,
  quantityLines,
} from '@/features/farmers/report/lib/display';
import type { ReportTableFeatures } from '@/features/farmers/report/lib/table-features';
import type { FarmerReportRequisition } from '@/features/farmers/report/types';
import { formatFacetLabel } from '@/features/seed-requisition/overview/components/view-filters/helpers';
import {
  formatRequisitionDate,
  formatSeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

export type ReportExportTable = Table<ReportTableFeatures, FarmerReportRequisition>;
export type ReportExportRow = Row<ReportTableFeatures, FarmerReportRequisition>;
export type ReportExportColumn = Column<ReportTableFeatures, FarmerReportRequisition, unknown>;

export type ExportCellValue =
  | { kind: 'empty' }
  | { kind: 'text'; value: string }
  | { kind: 'number'; value: number; format?: 'integer' | 'decimal' };

const GROUP_QUANTITY_COLUMN_IDS = new Set(['requested', 'dispatched', 'remaining']);

function emptyCell(): ExportCellValue {
  return { kind: 'empty' };
}

function textCell(value: string): ExportCellValue {
  return { kind: 'text', value };
}

export function formatQuantityLines(lines: QuantityLines): string {
  if (!lines.primary) return '—';
  if (!lines.secondary) return lines.primary;
  return `${lines.primary}\n${lines.secondary}`;
}

function quantityCell(row: FarmerReportRequisition, kind: QuantityKind): ExportCellValue {
  if (kind === 'dispatched' && isNothingDispatched(row)) {
    return textCell('None yet');
  }
  return textCell(formatQuantityLines(quantityLines(row, kind)));
}

function leafRows(row: ReportExportRow): FarmerReportRequisition[] {
  return row.getLeafRows().map((leaf) => leaf.original);
}

function leafCell(requisition: FarmerReportRequisition, columnId: string): ExportCellValue {
  switch (columnId) {
    case 'farmer': {
      const account = requisition.farmer.accountNumber.trim();
      const name = requisition.farmer.name;
      return textCell(account ? `${name} (#${account})` : name);
    }
    case 'family':
      return textCell(requisition.farmer.family?.name?.trim() || 'Independent');
    case 'station':
      return textCell(requisition.farmer.station.name);
    case 'contractDate': {
      const contract = requisition.contractDate
        ? formatRequisitionDate(requisition.contractDate)
        : '—';
      if (!requisition.requisitionDate) return textCell(contract);
      return textCell(
        `${contract}\nRequested ${formatRequisitionDate(requisition.requisitionDate)}`,
      );
    }
    case 'variety':
      return textCell(requisition.variety.name);
    case 'size': {
      const size = requisition.expectedSize;
      if (!size) return textCell('—');
      return textCell(`${size.name}\n${size.seedBagsPerAcre} bags/ac`);
    }
    case 'requested':
      return quantityCell(requisition, 'requested');
    case 'dispatched':
      return quantityCell(requisition, 'dispatched');
    case 'remaining':
      return quantityCell(requisition, 'remaining');
    case 'progress':
      return textCell(formatDispatchPercent(requisition));
    case 'status':
      return textCell(formatSeedRequisitionStatus(requisition.status));
    default:
      return emptyCell();
  }
}

function groupedCell(row: ReportExportRow, columnId: string): ExportCellValue {
  const leaves = leafRows(row);
  if (columnId === 'requested' || columnId === 'dispatched' || columnId === 'remaining') {
    return textCell(formatQuantityLines(groupQuantityLines(leaves, columnId)));
  }
  if (columnId === 'progress') {
    return textCell(formatGroupDispatchPercent(leaves));
  }
  return emptyCell();
}

export function getExportVisibleColumns(table: ReportExportTable): ReportExportColumn[] {
  return table.getVisibleLeafColumns();
}

export function getColumnExportLabel(column: ReportExportColumn): string {
  const metaLabel = column.columnDef.meta?.filterLabel;
  if (metaLabel) return metaLabel;

  const header = column.columnDef.header;
  if (typeof header === 'string') return header;
  return column.id;
}

export function collectExportRows(table: ReportExportTable): ReportExportRow[] {
  const grouping = table.store.state.grouping;

  if (grouping.length === 0) {
    return table.getSortedRowModel().rows;
  }

  function flattenGroupedRows(rows: ReportExportRow[]): ReportExportRow[] {
    const result: ReportExportRow[] = [];
    for (const row of rows) {
      result.push(row);
      if (row.subRows.length > 0) {
        result.push(...flattenGroupedRows(row.subRows));
      }
    }
    return result;
  }

  return flattenGroupedRows(table.getSortedRowModel().rows);
}

export function filteredLeafRequisitions(table: ReportExportTable): FarmerReportRequisition[] {
  return table
    .getFilteredRowModel()
    .flatRows.filter((row) => !row.getIsGrouped())
    .map((row) => row.original);
}

export function getExportCellForRow(
  row: ReportExportRow,
  column: ReportExportColumn,
): ExportCellValue {
  const cell = row.getVisibleCells().find((item) => item.column.id === column.id);

  if (cell?.getIsPlaceholder()) {
    return emptyCell();
  }

  if (cell?.getIsGrouped()) {
    const raw = row.getValue(column.id);
    if (raw == null || raw === '') return emptyCell();
    return textCell(formatFacetLabel(column, raw));
  }

  if (row.getIsGrouped()) {
    if (!GROUP_QUANTITY_COLUMN_IDS.has(column.id) && column.id !== 'progress') {
      return emptyCell();
    }
    return groupedCell(row, column.id);
  }

  return leafCell(row.original, column.id);
}

export function exportCellValueToPrimitive(cell: ExportCellValue): string | number {
  if (cell.kind === 'empty') return '';
  if (cell.kind === 'number') return cell.value;
  return cell.value;
}

export function getExportNumberFormat(cell: ExportCellValue): 'integer' | 'decimal' | undefined {
  if (cell.kind !== 'number') return undefined;
  return cell.format ?? 'integer';
}

function formatFilterValues(table: ReportExportTable, columnId: string, values: unknown[]): string {
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

export function buildReportFilterSummaryLines(table: ReportExportTable): string[] {
  const lines: string[] = [];
  const { columnFilters, grouping, sorting } = table.store.state;

  for (const filter of columnFilters) {
    if (!Array.isArray(filter.value) || filter.value.length === 0) continue;
    const column = table.getColumn(filter.id);
    const label = column ? getColumnExportLabel(column) : filter.id;
    lines.push(`${label}: ${formatFilterValues(table, filter.id, filter.value)}`);
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
