import type ExcelJS from 'exceljs';

export const COMPANY_SHORT_NAME = 'Bhatti Agritech';

export const EXPORT_THEME = {
  fonts: {
    family: 'Calibri',
    brandSize: 16,
    titleSize: 13,
    headerSize: 10,
    bodySize: 10,
    metaSize: 9,
  },
  text: {
    primary: 'FF1C1917',
    secondary: 'FF44403C',
    muted: 'FF78716C',
    onPrimary: 'FFFFFFFF',
  },
  brand: {
    primary: 'FF1447E6',
    primaryDark: 'FF0F2F9E',
    primarySoft: 'FFEEF3FF',
    primaryMuted: 'FFF7F8FB',
  },
  surface: {
    white: 'FFFFFFFF',
    zebra: 'FFF8FAFC',
    group: 'FFE8EEF9',
    totals: 'FFE7F0FF',
    border: 'FFE2E8F0',
    borderStrong: 'FFCBD5E1',
    filter: 'FFF8FAFC',
  },
  numFmt: {
    integer: '#,##0',
    decimal: '#,##0.00',
  },
} as const;

export function thinBorders(argb: string): Partial<ExcelJS.Borders> {
  const edge: ExcelJS.Border = { style: 'thin', color: { argb } };
  return { top: edge, right: edge, bottom: edge, left: edge };
}

export function sanitizeExportFileName(fileName: string) {
  const cleaned = fileName.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  return cleaned.endsWith('.xlsx') ? cleaned : `${cleaned}.xlsx`;
}
