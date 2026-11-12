import type ExcelJS from 'exceljs';
import {
  formatGroupDispatchPercent,
  groupQuantityLines,
} from '@/features/farmers/report/lib/display';
import {
  buildReportFilterSummaryLines,
  collectExportRows,
  exportCellValueToPrimitive,
  filteredLeafRequisitions,
  formatQuantityLines,
  getColumnExportLabel,
  getExportCellForRow,
  getExportNumberFormat,
  getExportVisibleColumns,
  type ReportExportTable,
} from '@/features/farmers/report/utils/export-cell-value';
import { downloadBlob } from '@/lib/download-blob';
import type { ExcelPackage, ExcelPreviewData, ExcelPreviewRow } from '@/lib/excel-preview-tab';
import {
  COMPANY_SHORT_NAME,
  EXPORT_THEME,
  sanitizeExportFileName,
  thinBorders,
} from '@/lib/export-report-theme';
import { loadExcelJS } from '@/lib/load-exceljs';

const REPORT_TITLE = 'Farmer Report';
const SHEET_NAME = 'Farmer Report';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const COLUMN_WIDTHS: Record<string, number> = {
  farmer: 32,
  family: 24,
  station: 18,
  contractDate: 22,
  variety: 16,
  size: 16,
  requested: 18,
  dispatched: 18,
  remaining: 18,
  progress: 18,
  status: 14,
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

function applyMergedHeaderStyle(
  cell: ExcelJS.Cell,
  opts: {
    fillArgb: string;
    fontSize: number;
    bold?: boolean;
    colorArgb?: string;
    wrapText?: boolean;
    horizontal?: ExcelJS.Alignment['horizontal'];
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
    horizontal: opts.horizontal ?? 'left',
    wrapText: opts.wrapText ?? false,
  };
}

function styleDataCell(
  cell: ExcelJS.Cell,
  opts: {
    zebra: boolean;
    isGroup: boolean;
    isTotals: boolean;
    isNumber: boolean;
    numFmt?: string;
  },
) {
  let fillArgb: string = EXPORT_THEME.surface.white;
  if (opts.isTotals) fillArgb = EXPORT_THEME.surface.totals;
  else if (opts.isGroup) fillArgb = EXPORT_THEME.surface.group;
  else if (opts.zebra) fillArgb = EXPORT_THEME.surface.zebra;

  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: fillArgb },
  };
  cell.border = thinBorders(
    opts.isTotals ? EXPORT_THEME.surface.borderStrong : EXPORT_THEME.surface.border,
  );
  cell.font = {
    name: EXPORT_THEME.fonts.family,
    size: EXPORT_THEME.fonts.bodySize,
    bold: opts.isGroup || opts.isTotals,
    color: { argb: EXPORT_THEME.text.primary },
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: opts.isNumber ? 'right' : 'left',
    wrapText: true,
  };
  if (opts.numFmt) {
    cell.numFmt = opts.numFmt;
  }
}

type SnapshotBodyRow = {
  values: Array<string | number>;
  formats: Array<'integer' | 'decimal' | undefined>;
  isGroupedOrAggregatedRow: boolean;
};

export type ReportExportSnapshot = {
  headers: string[];
  columnIds: string[];
  bodyRows: SnapshotBodyRow[];
  totalsValues: Array<string | number>;
  filterSummaryLines: string[];
  leafCount: number;
  generatedAtLabel: string;
  fileName: string;
  now: Date;
};

function buildTotalsValues(
  headers: string[],
  columnIds: string[],
  leaves: ReturnType<typeof filteredLeafRequisitions>,
): Array<string | number> {
  const totals: Array<string | number> = headers.map(() => '');
  if (headers.length === 0) return totals;

  totals[0] = 'Totals';

  for (let index = 0; index < columnIds.length; index += 1) {
    const columnId = columnIds[index];
    if (columnId === 'requested' || columnId === 'dispatched' || columnId === 'remaining') {
      totals[index] = formatQuantityLines(groupQuantityLines(leaves, columnId));
      continue;
    }
    if (columnId === 'progress') {
      totals[index] = formatGroupDispatchPercent(leaves);
    }
  }

  return totals;
}

export function buildReportExportSnapshot(table: ReportExportTable): ReportExportSnapshot {
  const leaves = filteredLeafRequisitions(table);
  if (leaves.length === 0) {
    throw new Error('No rows to export. Adjust filters or load report data.');
  }

  const visibleColumns = getExportVisibleColumns(table);
  const headers = visibleColumns.map((column) => getColumnExportLabel(column));
  const columnIds = visibleColumns.map((column) => column.id);
  const exportRows = collectExportRows(table);

  const bodyRows: SnapshotBodyRow[] = exportRows.map((row) => {
    const cells = visibleColumns.map((column) => getExportCellForRow(row, column));
    return {
      values: cells.map(exportCellValueToPrimitive),
      formats: cells.map(getExportNumberFormat),
      isGroupedOrAggregatedRow: row.getIsGrouped(),
    };
  });

  const now = new Date();

  return {
    headers,
    columnIds,
    bodyRows,
    totalsValues: buildTotalsValues(headers, columnIds, leaves),
    filterSummaryLines: buildReportFilterSummaryLines(table),
    leafCount: leaves.length,
    generatedAtLabel: `Generated ${formatGeneratedAt(now)}`,
    fileName: sanitizeExportFileName(`farmer-report_${isoDateStamp(now)}.xlsx`),
    now,
  };
}

function buildPreviewData(snapshot: ReportExportSnapshot): ExcelPreviewData {
  const rows: ExcelPreviewRow[] = [
    ...snapshot.bodyRows.map((row) => ({
      values: row.values,
      isGroupedOrAggregatedRow: row.isGroupedOrAggregatedRow,
    })),
    {
      values: snapshot.totalsValues,
      isTotalsRow: true,
    },
  ];

  return {
    brandTitle: COMPANY_SHORT_NAME,
    title: REPORT_TITLE,
    subtitle:
      'Export mirrors your current table view — filters, grouping, sorting, and visible columns.',
    fileName: snapshot.fileName,
    generatedAtLabel: snapshot.generatedAtLabel,
    metaLines: [
      `${snapshot.leafCount.toLocaleString('en-IN')} requisition${snapshot.leafCount === 1 ? '' : 's'}`,
      `${snapshot.headers.length} columns`,
    ],
    filterSummaryLines: snapshot.filterSummaryLines,
    headers: snapshot.headers,
    rows,
    totalBodyRowCount: snapshot.bodyRows.length + 1,
  };
}

function paintFill(row: ExcelJS.Row, columnCount: number, argb: string) {
  for (let col = 2; col <= columnCount; col += 1) {
    row.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    };
  }
}

async function writeWorkbook(snapshot: ReportExportSnapshot): Promise<ArrayBuffer> {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = COMPANY_SHORT_NAME;
  workbook.created = snapshot.now;
  workbook.modified = snapshot.now;

  const columnCount = Math.max(snapshot.headers.length, 1);
  const lastCol = columnLetter(columnCount - 1);

  const worksheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 8 }],
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
    if (columnCount > 1) {
      worksheet.mergeCells(`A${rowNumber}:${lastCol}${rowNumber}`);
    }
  };

  const brandRow = worksheet.addRow([COMPANY_SHORT_NAME]);
  mergeHeader(brandRow.number);
  brandRow.height = 28;
  applyMergedHeaderStyle(brandRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primary,
    fontSize: EXPORT_THEME.fonts.brandSize,
    colorArgb: EXPORT_THEME.text.onPrimary,
  });
  paintFill(brandRow, columnCount, EXPORT_THEME.brand.primary);

  const titleRow = worksheet.addRow([REPORT_TITLE]);
  mergeHeader(titleRow.number);
  titleRow.height = 22;
  applyMergedHeaderStyle(titleRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primaryDark,
    fontSize: EXPORT_THEME.fonts.titleSize,
    colorArgb: EXPORT_THEME.text.onPrimary,
  });
  paintFill(titleRow, columnCount, EXPORT_THEME.brand.primaryDark);

  const metaText = [
    snapshot.generatedAtLabel,
    `${snapshot.leafCount.toLocaleString('en-IN')} requisitions`,
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
  paintFill(metaRow, columnCount, EXPORT_THEME.brand.primarySoft);

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
  paintFill(filterRow, columnCount, EXPORT_THEME.surface.filter);

  const noteRow = worksheet.addRow(['Generated from Contract Farming']);
  mergeHeader(noteRow.number);
  noteRow.height = 16;
  applyMergedHeaderStyle(noteRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primaryMuted,
    fontSize: 9,
    bold: false,
    colorArgb: EXPORT_THEME.text.muted,
  });
  paintFill(noteRow, columnCount, EXPORT_THEME.brand.primaryMuted);

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
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.border = thinBorders(EXPORT_THEME.brand.primaryDark);
  }

  snapshot.bodyRows.forEach((row, rowIndex) => {
    const excelRow = worksheet.addRow(row.values);
    const wrapped = row.values.some((value) => typeof value === 'string' && value.includes('\n'));
    excelRow.height = wrapped ? 32 : row.isGroupedOrAggregatedRow ? 20 : 18;

    row.values.forEach((value, valueIndex) => {
      const cell = excelRow.getCell(valueIndex + 1);
      const format = row.formats[valueIndex];
      const isNumber = typeof value === 'number';
      styleDataCell(cell, {
        zebra: rowIndex % 2 === 1,
        isGroup: row.isGroupedOrAggregatedRow,
        isTotals: false,
        isNumber,
        numFmt: isNumber
          ? format === 'decimal'
            ? EXPORT_THEME.numFmt.decimal
            : EXPORT_THEME.numFmt.integer
          : undefined,
      });
    });
  });

  const totalsRow = worksheet.addRow(snapshot.totalsValues);
  const totalsWrapped = snapshot.totalsValues.some(
    (value) => typeof value === 'string' && value.includes('\n'),
  );
  totalsRow.height = totalsWrapped ? 32 : 22;
  snapshot.totalsValues.forEach((value, valueIndex) => {
    const cell = totalsRow.getCell(valueIndex + 1);
    const isNumber = typeof value === 'number';
    styleDataCell(cell, {
      zebra: false,
      isGroup: false,
      isTotals: true,
      isNumber: isNumber || valueIndex === 0,
      numFmt: isNumber ? EXPORT_THEME.numFmt.decimal : undefined,
    });
  });

  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
}

export async function buildFarmersReportExcelPackage(
  table: ReportExportTable,
): Promise<ExcelPackage> {
  const snapshot = buildReportExportSnapshot(table);
  const preview = buildPreviewData(snapshot);
  const buffer = await writeWorkbook(snapshot);
  return {
    buffer,
    fileName: snapshot.fileName,
    preview,
  };
}

export async function exportFarmersReportExcel(table: ReportExportTable): Promise<void> {
  const { buffer, fileName } = await buildFarmersReportExcelPackage(table);
  downloadBlob(new Blob([buffer], { type: XLSX_MIME }), fileName);
}
