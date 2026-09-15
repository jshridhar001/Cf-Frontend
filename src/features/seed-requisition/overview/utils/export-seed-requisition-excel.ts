import type ExcelJS from 'exceljs';
import { COMPANY_SHORT_NAME } from '@/features/farmers/contract/lib/farmer-contract';
import { buildFilterSummaryLines } from '@/features/seed-requisition/overview/utils/build-filter-summary';
import {
  collectExportRows,
  countFilteredLeafRows,
  exportCellValueToPrimitive,
  getColumnExportLabel,
  getExportCellForRow,
  getExportNumberFormat,
  getExportVisibleColumns,
  type RequisitionsExportTable,
} from '@/features/seed-requisition/overview/utils/export-cell-value';
import { downloadBlob } from '@/lib/download-blob';
import type { ExcelPackage, ExcelPreviewData, ExcelPreviewRow } from '@/lib/excel-preview-tab';
import { EXPORT_THEME, sanitizeExportFileName, thinBorders } from '@/lib/export-report-theme';
import { loadExcelJS } from '@/lib/load-exceljs';

const REPORT_TITLE = 'Seed Requisition Overview';
const SHEET_NAME = 'Seed Requisitions';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const COLUMN_WIDTHS: Record<string, number> = {
  farmer: 28,
  station: 18,
  variety: 16,
  bags: 10,
  acres: 10,
  requisitionDate: 16,
  requestedDeliveryDate: 16,
  approvedDeliveryDate: 16,
  status: 12,
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
  let fillArgb = EXPORT_THEME.surface.white;
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

function buildTotalsValues(
  headers: string[],
  columnIds: string[],
  bodyRows: SnapshotBodyRow[],
): Array<string | number> {
  const totals: Array<string | number> = headers.map(() => '');
  if (headers.length === 0) return totals;

  totals[0] = 'Totals';

  for (let index = 0; index < columnIds.length; index += 1) {
    const columnId = columnIds[index];
    if (columnId !== 'bags' && columnId !== 'acres') continue;

    let sum = 0;
    for (const row of bodyRows) {
      if (row.isGroupedOrAggregatedRow) continue;
      const value = row.values[index];
      if (typeof value === 'number' && Number.isFinite(value)) {
        sum += value;
      }
    }
    totals[index] = sum;
  }

  return totals;
}

function buildSnapshot(table: RequisitionsExportTable) {
  const leafCount = countFilteredLeafRows(table);
  if (leafCount === 0) {
    throw new Error('No rows to export. Adjust filters or load requisition data.');
  }

  const visibleColumns = getExportVisibleColumns(table);
  const headers = visibleColumns.map((column) => getColumnExportLabel(column));
  const columnIds = visibleColumns.map((column) => column.id);
  const exportRows = collectExportRows(table);
  const filterSummaryLines = buildFilterSummaryLines(table);

  const bodyRows: SnapshotBodyRow[] = exportRows.map((row) => {
    const cells = visibleColumns.map((column) => getExportCellForRow(row, column));
    return {
      values: cells.map(exportCellValueToPrimitive),
      formats: cells.map(getExportNumberFormat),
      isGroupedOrAggregatedRow: row.getIsGrouped(),
    };
  });

  const totalsValues = buildTotalsValues(headers, columnIds, bodyRows);
  const now = new Date();
  const generatedAtLabel = `Generated ${formatGeneratedAt(now)}`;
  const fileName = sanitizeExportFileName(`seed-requisitions_${isoDateStamp(now)}.xlsx`);

  return {
    visibleColumns,
    headers,
    columnIds,
    bodyRows,
    totalsValues,
    filterSummaryLines,
    leafCount,
    generatedAtLabel,
    fileName,
    now,
  };
}

function buildPreviewData(snapshot: ReturnType<typeof buildSnapshot>): ExcelPreviewData {
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

async function writeWorkbook(snapshot: ReturnType<typeof buildSnapshot>): Promise<ArrayBuffer> {
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

  // 1 — Brand
  const brandRow = worksheet.addRow([COMPANY_SHORT_NAME]);
  mergeHeader(brandRow.number);
  brandRow.height = 28;
  applyMergedHeaderStyle(brandRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primary,
    fontSize: EXPORT_THEME.fonts.brandSize,
    colorArgb: EXPORT_THEME.text.onPrimary,
  });
  for (let col = 2; col <= columnCount; col += 1) {
    brandRow.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXPORT_THEME.brand.primary },
    };
  }

  // 2 — Title
  const titleRow = worksheet.addRow([REPORT_TITLE]);
  mergeHeader(titleRow.number);
  titleRow.height = 22;
  applyMergedHeaderStyle(titleRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primaryDark,
    fontSize: EXPORT_THEME.fonts.titleSize,
    colorArgb: EXPORT_THEME.text.onPrimary,
  });
  for (let col = 2; col <= columnCount; col += 1) {
    titleRow.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXPORT_THEME.brand.primaryDark },
    };
  }

  // 3 — Meta
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
  for (let col = 2; col <= columnCount; col += 1) {
    metaRow.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXPORT_THEME.brand.primarySoft },
    };
  }

  // 4 — Filter summary
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
  for (let col = 2; col <= columnCount; col += 1) {
    filterRow.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXPORT_THEME.surface.filter },
    };
  }

  // 5 — Branding note
  const noteRow = worksheet.addRow(['Generated from Contract Farming']);
  mergeHeader(noteRow.number);
  noteRow.height = 16;
  applyMergedHeaderStyle(noteRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primaryMuted,
    fontSize: 9,
    bold: false,
    colorArgb: EXPORT_THEME.text.muted,
  });
  for (let col = 2; col <= columnCount; col += 1) {
    noteRow.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXPORT_THEME.brand.primaryMuted },
    };
  }

  // 6 — Spacer
  const spacer = worksheet.addRow([]);
  spacer.height = 8;

  // 7 — Column headers
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

  // 8 — Body
  snapshot.bodyRows.forEach((row, rowIndex) => {
    const excelRow = worksheet.addRow(row.values);
    excelRow.height = row.isGroupedOrAggregatedRow ? 20 : 18;

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

  // 9 — Totals
  const totalsRow = worksheet.addRow(snapshot.totalsValues);
  totalsRow.height = 22;
  snapshot.totalsValues.forEach((value, valueIndex) => {
    const cell = totalsRow.getCell(valueIndex + 1);
    const columnId = snapshot.columnIds[valueIndex];
    const isNumber = typeof value === 'number';
    styleDataCell(cell, {
      zebra: false,
      isGroup: false,
      isTotals: true,
      isNumber: isNumber || valueIndex === 0,
      numFmt: isNumber
        ? columnId === 'acres'
          ? EXPORT_THEME.numFmt.decimal
          : EXPORT_THEME.numFmt.integer
        : undefined,
    });
  });

  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
}

export async function buildSeedRequisitionExcelPackage(
  table: RequisitionsExportTable,
): Promise<ExcelPackage> {
  const snapshot = buildSnapshot(table);
  const preview = buildPreviewData(snapshot);
  const buffer = await writeWorkbook(snapshot);
  return {
    buffer,
    fileName: snapshot.fileName,
    preview,
  };
}

export async function exportSeedRequisitionExcel(table: RequisitionsExportTable): Promise<void> {
  const { buffer, fileName } = await buildSeedRequisitionExcelPackage(table);
  downloadBlob(new Blob([buffer], { type: XLSX_MIME }), fileName);
}
