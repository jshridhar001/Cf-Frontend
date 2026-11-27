import type ExcelJS from 'exceljs';
import type {
  DispatchRow,
  FamilyDispatchSummary,
} from '@/features/farmers/analytics/lib/compute-family-dispatch';
import { downloadBlob } from '@/lib/download-blob';
import type { ExcelPackage, ExcelPreviewData, ExcelPreviewRow } from '@/lib/excel-preview-tab';
import {
  COMPANY_SHORT_NAME,
  EXPORT_THEME,
  sanitizeExportFileName,
  thinBorders,
} from '@/lib/export-report-theme';
import { loadExcelJS } from '@/lib/load-exceljs';

const REPORT_TITLE = 'Dispatch summary';
const SHEET_NAME = 'Dispatch summary';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const HEADERS = ['Name', 'Contracted (ac)', 'Dispatched (ac)', 'Remaining (ac)', 'Sent %'] as const;
const COLUMN_WIDTHS = [36, 18, 18, 18, 12];

type SummaryTotals = Pick<
  FamilyDispatchSummary,
  'contractedAcres' | 'dispatchedAcres' | 'remainingAcres' | 'percent'
>;

export type DispatchSummaryExportInput = {
  rows: DispatchRow[];
  summary: SummaryTotals;
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

function rowValues(row: DispatchRow): Array<string | number> {
  return [row.name, row.contractedAcres, row.dispatchedAcres, row.remainingAcres, row.percent];
}

function totalsValues(summary: SummaryTotals): Array<string | number> {
  return [
    'Total',
    summary.contractedAcres,
    summary.dispatchedAcres,
    summary.remainingAcres,
    summary.percent,
  ];
}

function applyMergedHeaderStyle(
  cell: ExcelJS.Cell,
  opts: {
    fillArgb: string;
    fontSize: number;
    bold?: boolean;
    colorArgb?: string;
  },
) {
  cell.font = {
    name: EXPORT_THEME.fonts.family,
    size: opts.fontSize,
    bold: opts.bold ?? true,
    color: { argb: opts.colorArgb ?? EXPORT_THEME.text.primary },
  };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

function paintFill(row: ExcelJS.Row, columnCount: number, argb: string) {
  for (let col = 1; col <= columnCount; col += 1) {
    row.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    };
  }
}

function styleDataCell(
  cell: ExcelJS.Cell,
  opts: { zebra: boolean; isTotals: boolean; numberFormat?: 'acres' | 'percent' },
) {
  let fillArgb: string = EXPORT_THEME.surface.white;
  if (opts.isTotals) fillArgb = EXPORT_THEME.surface.totals;
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
    bold: opts.isTotals,
    color: { argb: EXPORT_THEME.text.primary },
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: opts.numberFormat ? 'right' : 'left',
  };
  if (opts.numberFormat === 'acres') cell.numFmt = EXPORT_THEME.numFmt.decimal;
  if (opts.numberFormat === 'percent') cell.numFmt = '0"%"';
}

async function writeWorkbook(
  rows: DispatchRow[],
  summary: SummaryTotals,
  now: Date,
): Promise<ArrayBuffer> {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = COMPANY_SHORT_NAME;
  workbook.created = now;
  workbook.modified = now;

  const columnCount = HEADERS.length;
  const lastCol = columnLetter(columnCount - 1);
  const worksheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 6 }],
  });

  worksheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
  };
  worksheet.columns = HEADERS.map((header, index) => ({
    key: header,
    width: COLUMN_WIDTHS[index],
  }));

  const mergeHeader = (rowNumber: number) => {
    worksheet.mergeCells(`A${rowNumber}:${lastCol}${rowNumber}`);
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

  const metaRow = worksheet.addRow([
    `${formatGeneratedAt(now)}  ·  ${rows.length.toLocaleString('en-IN')} rows`,
  ]);
  mergeHeader(metaRow.number);
  metaRow.height = 18;
  applyMergedHeaderStyle(metaRow.getCell(1), {
    fillArgb: EXPORT_THEME.brand.primarySoft,
    fontSize: EXPORT_THEME.fonts.metaSize,
    bold: false,
    colorArgb: EXPORT_THEME.text.secondary,
  });
  paintFill(metaRow, columnCount, EXPORT_THEME.brand.primarySoft);

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

  const headerRow = worksheet.addRow([...HEADERS]);
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
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorders(EXPORT_THEME.brand.primaryDark);
  }

  const writeValues = (
    values: Array<string | number>,
    opts: { zebra: boolean; isTotals: boolean },
  ) => {
    const excelRow = worksheet.addRow(values);
    excelRow.height = opts.isTotals ? 22 : 18;
    values.forEach((value, index) => {
      const numberFormat =
        typeof value !== 'number' ? undefined : index === values.length - 1 ? 'percent' : 'acres';
      styleDataCell(excelRow.getCell(index + 1), {
        zebra: opts.zebra,
        isTotals: opts.isTotals,
        numberFormat,
      });
    });
  };

  rows.forEach((row, index) => {
    writeValues(rowValues(row), { zebra: index % 2 === 1, isTotals: false });
  });
  writeValues(totalsValues(summary), { zebra: false, isTotals: true });

  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
}

function buildPreviewData(
  rows: DispatchRow[],
  summary: SummaryTotals,
  fileName: string,
  generatedAtLabel: string,
): ExcelPreviewData {
  const previewRows: ExcelPreviewRow[] = [
    ...rows.map((row) => ({ values: rowValues(row) })),
    { values: totalsValues(summary), isTotalsRow: true },
  ];

  return {
    brandTitle: COMPANY_SHORT_NAME,
    title: REPORT_TITLE,
    subtitle: 'One row per family, or per farmer who is not in a family.',
    fileName,
    generatedAtLabel,
    metaLines: [`${rows.length.toLocaleString('en-IN')} row${rows.length === 1 ? '' : 's'}`],
    filterSummaryLines: [],
    headers: [...HEADERS],
    rows: previewRows,
    totalBodyRowCount: previewRows.length,
  };
}

export async function buildDispatchSummaryExcelPackage(
  input: DispatchSummaryExportInput,
): Promise<ExcelPackage> {
  if (input.rows.length === 0) {
    throw new Error('No rows to export.');
  }

  const now = new Date();
  const fileName = sanitizeExportFileName(`dispatch-summary-${isoDateStamp(now)}.xlsx`);
  const buffer = await writeWorkbook(input.rows, input.summary, now);
  return {
    buffer,
    fileName,
    preview: buildPreviewData(
      input.rows,
      input.summary,
      fileName,
      `Generated ${formatGeneratedAt(now)}`,
    ),
  };
}

export async function exportDispatchSummaryExcel(input: DispatchSummaryExportInput): Promise<void> {
  const { buffer, fileName } = await buildDispatchSummaryExcelPackage(input);
  downloadBlob(new Blob([buffer], { type: XLSX_MIME }), fileName);
}
