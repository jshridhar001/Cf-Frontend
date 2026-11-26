import type ExcelJS from 'exceljs';
import type { TasksTable } from '@/features/task-manager/components/use-tasks-table';
import { downloadBlob } from '@/lib/download-blob';
import type { ExcelPackage, ExcelPreviewData, ExcelPreviewRow } from '@/lib/excel-preview-tab';
import {
  COMPANY_SHORT_NAME,
  EXPORT_THEME,
  sanitizeExportFileName,
  thinBorders,
} from '@/lib/export-report-theme';
import { loadExcelJS } from '@/lib/load-exceljs';

const REPORT_TITLE = 'Task Manager';
const SHEET_NAME = 'Tasks';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const COLUMN_WIDTHS: Record<string, number> = {
  task: 36,
  field: 24,
  farmer: 24,
  officer: 24,
  dueDate: 16,
  status: 14,
};

type TaskExportRow = ReturnType<TasksTable['getRowModel']>['rows'][number];
type TaskExportColumn = ReturnType<TasksTable['getVisibleLeafColumns']>[number];

type SnapshotBodyRow = {
  values: string[];
  isGroup: boolean;
};

function columnLetter(index: number): string {
  let n = index + 1;
  let letter = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function isoDateStamp(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function taskCountLabel(count: number) {
  return `${count.toLocaleString('en-IN')} ${count === 1 ? 'task' : 'tasks'}`;
}

function leafCount(row: TaskExportRow): number {
  if (!row.getIsGrouped()) return 1;
  return row.subRows.reduce((sum, child) => sum + leafCount(child), 0);
}

function columnLabel(column: TaskExportColumn): string {
  const metaLabel = column.columnDef.meta?.filterLabel;
  if (metaLabel) return metaLabel;
  const header = column.columnDef.header;
  if (typeof header === 'string') return header;
  return column.id;
}

function applyMergedHeaderStyle(
  cell: ExcelJS.Cell,
  opts: {
    fillArgb: string;
    fontSize: number;
    bold?: boolean;
    colorArgb?: string;
    wrapText?: boolean;
  },
) {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: opts.fillArgb },
  };
  cell.font = {
    name: EXPORT_THEME.fonts.family,
    size: opts.fontSize,
    bold: opts.bold ?? true,
    color: { argb: opts.colorArgb ?? EXPORT_THEME.text.primary },
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
    wrapText: opts.wrapText ?? false,
  };
}

function paintRowFill(row: ExcelJS.Row, columnCount: number, argb: string) {
  for (let col = 2; col <= columnCount; col += 1) {
    row.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    };
  }
}

function collectExportRows(table: TasksTable): TaskExportRow[] {
  function flatten(rows: TaskExportRow[]): TaskExportRow[] {
    const result: TaskExportRow[] = [];
    for (const row of rows) {
      result.push(row);
      if (row.subRows.length > 0) result.push(...flatten(row.subRows));
    }
    return result;
  }

  return flatten(table.getGroupedRowModel().rows);
}

function leafText(row: TaskExportRow, columnId: string): string {
  const item = row.original;
  switch (columnId) {
    case 'task':
      return item.activityLabel;
    case 'field':
      return item.fieldName;
    case 'farmer':
      return item.farmerName;
    case 'officer':
      return item.officerName;
    case 'dueDate':
      return item.dueLabel;
    case 'status':
      return item.status.label;
    default:
      return '';
  }
}

function rowValues(row: TaskExportRow, columns: TaskExportColumn[]): string[] {
  if (!row.getIsGrouped()) {
    return columns.map((column) => leafText(row, column.id));
  }

  return columns.map((column) => {
    const cell = row.getVisibleCells().find((item) => item.column.id === column.id);
    if (!cell?.getIsGrouped()) return '';
    const raw = row.getValue(column.id);
    const label = raw == null || raw === '' ? 'Blank' : String(raw);
    const indent = '  '.repeat(row.depth);
    return `${indent}${label} · ${taskCountLabel(leafCount(row))}`;
  });
}

function buildFilterSummaryLines(table: TasksTable): string[] {
  const lines: string[] = [];
  const { columnFilters, globalFilter, grouping } = table.state;

  for (const filter of columnFilters) {
    if (!Array.isArray(filter.value) || filter.value.length === 0) continue;
    const column = table.getColumn(filter.id);
    const label = column ? columnLabel(column) : filter.id;
    const values = filter.value
      .map((value) => (value == null || value === '' ? 'Blank' : String(value)))
      .join(', ');
    lines.push(`${label}: ${values}`);
  }

  if (typeof globalFilter === 'string' && globalFilter.trim()) {
    lines.push(`Search: “${globalFilter.trim()}”`);
  }

  if (grouping.length > 0) {
    const labels = grouping.map((columnId) => {
      const column = table.getColumn(columnId);
      return column ? columnLabel(column) : columnId;
    });
    lines.push(`Grouped by: ${labels.join(' → ')}`);
  }

  return lines;
}

function buildSnapshot(table: TasksTable) {
  const leafTotal = table
    .getFilteredRowModel()
    .flatRows.filter((row) => !row.getIsGrouped()).length;
  if (leafTotal === 0) {
    throw new Error('No rows to export. Adjust filters or load task data.');
  }

  const visibleColumns = table.getVisibleLeafColumns();
  const headers = visibleColumns.map(columnLabel);
  const columnIds = visibleColumns.map((column) => column.id);
  const bodyRows: SnapshotBodyRow[] = collectExportRows(table).map((row) => ({
    values: rowValues(row, visibleColumns),
    isGroup: row.getIsGrouped(),
  }));
  const now = new Date();

  return {
    headers,
    columnIds,
    bodyRows,
    filterSummaryLines: buildFilterSummaryLines(table),
    leafTotal,
    generatedAtLabel: `Generated ${formatGeneratedAt(now)}`,
    fileName: sanitizeExportFileName(`task-manager_${isoDateStamp(now)}.xlsx`),
    now,
  };
}

async function writeWorkbook(snapshot: ReturnType<typeof buildSnapshot>): Promise<ArrayBuffer> {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = COMPANY_SHORT_NAME;
  workbook.created = snapshot.now;
  workbook.modified = snapshot.now;

  const columnCount = Math.max(snapshot.headers.length, 1);
  const lastCol = columnLetter(columnCount - 1);
  const worksheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 7 }],
  });

  worksheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };

  worksheet.columns = snapshot.headers.map((header, index) => ({
    key: header,
    width: COLUMN_WIDTHS[snapshot.columnIds[index] ?? ''] ?? 14,
  }));

  const mergeHeader = (rowNumber: number) => {
    if (columnCount > 1) worksheet.mergeCells(`A${rowNumber}:${lastCol}${rowNumber}`);
  };

  const brandRow = worksheet.addRow([COMPANY_SHORT_NAME]);
  mergeHeader(brandRow.number);
  brandRow.height = 28;
  applyMergedHeaderStyle(brandRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primary,
    fontSize: EXPORT_THEME.fonts.brandSize,
    colorArgb: EXPORT_THEME.text.onPrimary,
  });
  paintRowFill(brandRow, columnCount, EXPORT_THEME.brand.primary);

  const titleRow = worksheet.addRow([REPORT_TITLE]);
  mergeHeader(titleRow.number);
  titleRow.height = 22;
  applyMergedHeaderStyle(titleRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primaryDark,
    fontSize: EXPORT_THEME.fonts.titleSize,
    colorArgb: EXPORT_THEME.text.onPrimary,
  });
  paintRowFill(titleRow, columnCount, EXPORT_THEME.brand.primaryDark);

  const metaText = [
    snapshot.generatedAtLabel,
    taskCountLabel(snapshot.leafTotal),
    `${snapshot.headers.length} columns`,
  ].join('  ·  ');
  const metaRow = worksheet.addRow([metaText]);
  mergeHeader(metaRow.number);
  metaRow.height = 18;
  applyMergedHeaderStyle(metaRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primarySoft,
    fontSize: EXPORT_THEME.fonts.metaSize,
    bold: false,
    colorArgb: EXPORT_THEME.text.secondary,
  });
  paintRowFill(metaRow, columnCount, EXPORT_THEME.brand.primarySoft);

  const filterText =
    snapshot.filterSummaryLines.length > 0
      ? snapshot.filterSummaryLines.join('\n')
      : 'Filters: none applied';
  const filterRow = worksheet.addRow([filterText]);
  mergeHeader(filterRow.number);
  filterRow.height = Math.min(18 + snapshot.filterSummaryLines.length * 12, 72);
  applyMergedHeaderStyle(filterRow.getCell(1), {
    fillArgb: EXPORT_THEME.surface.filter,
    fontSize: EXPORT_THEME.fonts.metaSize,
    bold: false,
    colorArgb: EXPORT_THEME.text.primary,
    wrapText: true,
  });
  paintRowFill(filterRow, columnCount, EXPORT_THEME.surface.filter);

  const noteRow = worksheet.addRow(['Generated from Contract Farming']);
  mergeHeader(noteRow.number);
  noteRow.height = 16;
  applyMergedHeaderStyle(noteRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primaryMuted,
    fontSize: 9,
    bold: false,
    colorArgb: EXPORT_THEME.text.muted,
  });
  paintRowFill(noteRow, columnCount, EXPORT_THEME.brand.primaryMuted);

  const spacer = worksheet.addRow([]);
  spacer.height = 8;

  const headerRow = worksheet.addRow(snapshot.headers);
  headerRow.height = 22;
  for (let col = 1; col <= columnCount; col += 1) {
    const cell = headerRow.getCell(col);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXPORT_THEME.brand.primary },
    };
    cell.font = {
      name: EXPORT_THEME.fonts.family,
      size: EXPORT_THEME.fonts.headerSize,
      bold: true,
      color: { argb: EXPORT_THEME.text.onPrimary },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorders(EXPORT_THEME.brand.primaryDark);
  }

  snapshot.bodyRows.forEach((row, rowIndex) => {
    const excelRow = worksheet.addRow(row.values);
    excelRow.height = row.isGroup ? 20 : 18;
    row.values.forEach((_value, valueIndex) => {
      const cell = excelRow.getCell(valueIndex + 1);
      const fillArgb = row.isGroup
        ? EXPORT_THEME.surface.group
        : rowIndex % 2 === 1
          ? EXPORT_THEME.surface.zebra
          : EXPORT_THEME.surface.white;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
      cell.border = thinBorders(EXPORT_THEME.surface.border);
      cell.font = {
        name: EXPORT_THEME.fonts.family,
        size: EXPORT_THEME.fonts.bodySize,
        bold: row.isGroup,
        color: { argb: EXPORT_THEME.text.primary },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  });

  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
}

function buildPreviewData(snapshot: ReturnType<typeof buildSnapshot>): ExcelPreviewData {
  const rows: ExcelPreviewRow[] = snapshot.bodyRows.map((row) => ({
    values: row.values,
    isGroupedOrAggregatedRow: row.isGroup,
  }));

  return {
    brandTitle: COMPANY_SHORT_NAME,
    title: REPORT_TITLE,
    subtitle: 'Export mirrors your current table view — filters, grouping, and visible columns.',
    fileName: snapshot.fileName,
    generatedAtLabel: snapshot.generatedAtLabel,
    metaLines: [taskCountLabel(snapshot.leafTotal), `${snapshot.headers.length} columns`],
    filterSummaryLines: snapshot.filterSummaryLines,
    headers: snapshot.headers,
    rows,
    totalBodyRowCount: snapshot.bodyRows.length,
  };
}

export async function buildTaskManagerExcelPackage(table: TasksTable): Promise<ExcelPackage> {
  const snapshot = buildSnapshot(table);
  const preview = buildPreviewData(snapshot);
  const buffer = await writeWorkbook(snapshot);
  return {
    buffer,
    fileName: snapshot.fileName,
    preview,
  };
}

export async function exportTaskManagerExcel(table: TasksTable): Promise<void> {
  const { buffer, fileName } = await buildTaskManagerExcelPackage(table);
  downloadBlob(new Blob([buffer], { type: XLSX_MIME }), fileName);
}
