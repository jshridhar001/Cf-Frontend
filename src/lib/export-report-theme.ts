/** Shared ARGB colors and number formats for branded Excel exports. */

export const EXPORT_THEME = {
  brand: {
    /** Chart / Excel green — #016630 */
    primary: 'FF016630',
    primaryDark: 'FF014D24',
    primarySoft: 'FFDCEFE4',
    primaryMuted: 'FFF0F7F3',
  },
  text: {
    primary: 'FF0A2E1A',
    secondary: 'FF4A6354',
    onPrimary: 'FFFFFFFF',
    muted: 'FF7A9485',
  },
  surface: {
    white: 'FFFFFFFF',
    zebra: 'FFF5FAF7',
    group: 'FFDCEFE4',
    totals: 'FFB8DCC8',
    filter: 'FFEFF6F2',
    border: 'FFA3C9B3',
    borderStrong: 'FF6FA88A',
  },
  fonts: {
    family: 'Calibri',
    brandSize: 18,
    titleSize: 14,
    metaSize: 10,
    headerSize: 11,
    bodySize: 10,
  },
  numFmt: {
    integer: '#,##,##0',
    decimal: '#,##,##0.00',
  },
} satisfies {
  brand: Record<string, string>;
  text: Record<string, string>;
  surface: Record<string, string>;
  fonts: {
    family: string;
    brandSize: number;
    titleSize: number;
    metaSize: number;
    headerSize: number;
    bodySize: number;
  };
  numFmt: {
    integer: string;
    decimal: string;
  };
};

export type ExportThinBorder = {
  style: 'thin';
  color: { argb: string };
};

export function thinBorder(argb = EXPORT_THEME.surface.border): ExportThinBorder {
  return { style: 'thin', color: { argb } };
}

export function thinBorders(argb = EXPORT_THEME.surface.border) {
  const edge = thinBorder(argb);
  return {
    top: edge,
    left: edge,
    bottom: edge,
    right: edge,
  };
}

export function sanitizeExportFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .slice(0, 180);
}
