import type { Column, Row, Table } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/features/seed-requisition/overview/components/data-table-features';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';
import {
  formatRequisitionDate,
  formatSeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

export type RequisitionsExportTable = Table<DataTableFeatures, SeedRequisition>;
export type RequisitionsExportRow = Row<DataTableFeatures, SeedRequisition>;
export type RequisitionsExportColumn = Column<DataTableFeatures, SeedRequisition, unknown>;

export type ExportCellValue =
  | { kind: 'empty' }
  | { kind: 'text'; value: string }
  | { kind: 'number'; value: number; format?: 'integer' | 'decimal' };

const SUM_AGGREGATED_COLUMN_IDS = new Set(['bags', 'acres']);
const EXPORT_EXCLUDED_COLUMN_IDS = new Set(['actions']);

function hasRequestedAcres(requisition: SeedRequisition) {
  return requisition.requestedAcres != null && requisition.requestedAcres !== '';
}

function acresNumber(requisition: SeedRequisition): number | null {
  if (!hasRequestedAcres(requisition)) return null;
  const acres = Number(requisition.requestedAcres);
  return Number.isFinite(acres) ? acres : null;
}

export function getExportVisibleColumns(
  table: RequisitionsExportTable,
): RequisitionsExportColumn[] {
  return table
    .getVisibleLeafColumns()
    .filter((column) => !EXPORT_EXCLUDED_COLUMN_IDS.has(column.id));
}

export function getColumnExportLabel(column: RequisitionsExportColumn): string {
  const metaLabel = column.columnDef.meta?.filterLabel;
  if (metaLabel) return metaLabel;

  const header = column.columnDef.header;
  if (typeof header === 'string') return header;
  return column.id;
}

export function collectExportRows(table: RequisitionsExportTable): RequisitionsExportRow[] {
  const grouping = table.store.state.grouping;

  if (grouping.length === 0) {
    return table.getSortedRowModel().rows;
  }

  function flattenGroupedRows(rows: RequisitionsExportRow[]): RequisitionsExportRow[] {
    const result: RequisitionsExportRow[] = [];
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

export function countFilteredLeafRows(table: RequisitionsExportTable): number {
  return table.getFilteredRowModel().flatRows.filter((row) => !row.getIsGrouped()).length;
}

function emptyCell(): ExportCellValue {
  return { kind: 'empty' };
}

function textCell(value: string): ExportCellValue {
  return { kind: 'text', value };
}

function numberCell(value: number, format: 'integer' | 'decimal' = 'integer'): ExportCellValue {
  return { kind: 'number', value, format };
}

function leafCellForColumn(requisition: SeedRequisition, columnId: string): ExportCellValue {
  switch (columnId) {
    case 'farmer': {
      const name = requisition.farmer?.name ?? 'Unknown farmer';
      const accountNumber = requisition.farmer?.accountNumber;
      return textCell(accountNumber ? `${name} (#${accountNumber})` : name);
    }
    case 'station':
      return textCell(requisition.farmer?.station?.name?.trim() || '—');
    case 'variety':
      return textCell(requisition.variety?.name ?? 'Unknown variety');
    case 'bags': {
      if (hasRequestedAcres(requisition)) return emptyCell();
      return numberCell(requisition.requestedBags ?? 0, 'integer');
    }
    case 'acres': {
      const acres = acresNumber(requisition);
      if (acres == null) return emptyCell();
      return numberCell(acres, 'decimal');
    }
    case 'requisitionDate':
      return textCell(formatRequisitionDate(requisition.requisitionDate));
    case 'requestedDeliveryDate':
      return textCell(formatRequisitionDate(requisition.requestedDeliveryDate));
    case 'approvedDeliveryDate':
      return textCell(
        requisition.approvedDeliveryDate
          ? formatRequisitionDate(requisition.approvedDeliveryDate)
          : '—',
      );
    case 'status':
      return textCell(formatSeedRequisitionStatus(requisition.status));
    default:
      return emptyCell();
  }
}

function aggregatedNumberCell(
  row: RequisitionsExportRow,
  column: RequisitionsExportColumn,
  format: 'integer' | 'decimal',
): ExportCellValue {
  const value = row.getValue(column.id);
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount)) return emptyCell();
  return numberCell(amount, format);
}

export function getExportCellForRow(
  row: RequisitionsExportRow,
  column: RequisitionsExportColumn,
): ExportCellValue {
  const cell = row.getVisibleCells().find((item) => item.column.id === column.id);

  if (cell?.getIsPlaceholder()) {
    return emptyCell();
  }

  if (cell?.getIsGrouped()) {
    const raw = row.getValue(column.id);
    if (raw == null || raw === '') return emptyCell();
    return textCell(String(raw));
  }

  if (row.getIsGrouped()) {
    if (!SUM_AGGREGATED_COLUMN_IDS.has(column.id)) {
      return emptyCell();
    }
    return aggregatedNumberCell(row, column, column.id === 'acres' ? 'decimal' : 'integer');
  }

  return leafCellForColumn(row.original, column.id);
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
