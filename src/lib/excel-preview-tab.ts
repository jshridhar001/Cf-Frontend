export const EXCEL_PREVIEW_MAX_ROWS = 400;

export type ExcelPreviewCell = string | number;

export type ExcelPreviewRow = {
  values: ExcelPreviewCell[];
  isSectionTitle?: boolean;
  isTotalsRow?: boolean;
  isGroupedOrAggregatedRow?: boolean;
  boldByColumn?: boolean[];
};

export type ExcelPreviewData = {
  brandTitle: string;
  title: string;
  subtitle?: string;
  fileName: string;
  generatedAtLabel: string;
  metaLines: string[];
  filterSummaryLines: string[];
  headers: string[];
  rows: ExcelPreviewRow[];
  /** Full row count before HTML truncation (body data rows only). */
  totalBodyRowCount: number;
};

export type ExcelPackage = {
  buffer: ArrayBuffer;
  fileName: string;
  preview: ExcelPreviewData;
};

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

let lastPreviewBlobUrl: string | null = null;

function revokeLastPreviewBlobUrl() {
  if (!lastPreviewBlobUrl) return;
  URL.revokeObjectURL(lastPreviewBlobUrl);
  lastPreviewBlobUrl = null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPreviewCell(value: ExcelPreviewCell): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(value);
  }
  return escapeHtml(String(value));
}

function cellClass(row: ExcelPreviewRow, columnIndex: number, value: ExcelPreviewCell): string {
  const classes = ['cell'];
  if (typeof value === 'number') classes.push('num');
  if (row.isTotalsRow) classes.push('totals');
  if (row.isGroupedOrAggregatedRow) classes.push('group');
  if (row.isSectionTitle) classes.push('section');
  if (row.boldByColumn?.[columnIndex]) classes.push('bold');
  return classes.join(' ');
}

function buildPreviewDocumentHtml(preview: ExcelPreviewData, blobUrl: string): string {
  const truncated = preview.totalBodyRowCount > EXCEL_PREVIEW_MAX_ROWS;
  const visibleRows = preview.rows.slice(0, EXCEL_PREVIEW_MAX_ROWS);

  const metaHtml = preview.metaLines
    .map((line) => `<span class="chip">${escapeHtml(line)}</span>`)
    .join('');

  const filterHtml =
    preview.filterSummaryLines.length > 0
      ? preview.filterSummaryLines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')
      : '<li class="muted">Filters: none applied</li>';

  const headerHtml = preview.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');

  const bodyHtml = visibleRows
    .map((row) => {
      const cells = row.values
        .map((value, index) => {
          const cls = cellClass(row, index, value);
          return `<td class="${cls}">${formatPreviewCell(value)}</td>`;
        })
        .join('');
      const rowClass = [
        row.isTotalsRow ? 'row-totals' : '',
        row.isGroupedOrAggregatedRow ? 'row-group' : '',
        row.isSectionTitle ? 'row-section' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<tr class="${rowClass}">${cells}</tr>`;
    })
    .join('');

  const truncationNotice = truncated
    ? `<p class="notice">Showing first ${EXCEL_PREVIEW_MAX_ROWS.toLocaleString('en-IN')} of ${preview.totalBodyRowCount.toLocaleString('en-IN')} rows. Download the Excel file for the full export.</p>`
    : '';

  const subtitle = preview.subtitle
    ? `<p class="subtitle">${escapeHtml(preview.subtitle)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(preview.title)} — Preview</title>
  <style>
    :root {
      --ink: #0a2e1a;
      --muted: #4a6354;
      --line: #c5ddd0;
      --soft: #f5faf7;
      --brand: #016630;
      --brand-dark: #014d24;
      --brand-soft: #dcefe4;
      --group: #dcefe4;
      --totals: #b8dcc8;
      --surface: #ffffff;
      --shadow: 0 1px 2px rgb(1 102 48 / 6%), 0 8px 24px rgb(1 102 48 / 8%);
      --radius: 14px;
      font-family: "Segoe UI", Calibri, system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      background:
        radial-gradient(1200px 400px at 10% -10%, #dcefe4 0%, transparent 55%),
        radial-gradient(900px 360px at 100% 0%, #eff6f2 0%, transparent 50%),
        #f5faf7;
      min-height: 100vh;
    }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 24px;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--line);
    }
    .brand-block { min-width: 0; }
    .brand {
      margin: 0;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--brand);
    }
    .title {
      margin: 2px 0 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--ink);
    }
    .download {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 999px;
      background: linear-gradient(180deg, var(--brand) 0%, var(--brand-dark) 100%);
      color: #fff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 8px 20px rgb(1 102 48 / 28%);
      white-space: nowrap;
    }
    .download:hover { filter: brightness(1.05); }
    .wrap {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    .hero {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 22px 24px;
      margin-bottom: 18px;
    }
    .subtitle {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 14px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: var(--soft);
      border: 1px solid var(--line);
      color: var(--muted);
      font-size: 12px;
      font-weight: 500;
    }
    .filters {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 16px 20px;
      margin-bottom: 18px;
    }
    .filters h2 {
      margin: 0 0 10px;
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--brand);
    }
    .filters ul {
      margin: 0;
      padding-left: 18px;
      color: var(--ink);
      font-size: 13px;
      line-height: 1.55;
    }
    .filters .muted { color: var(--muted); }
    .notice {
      margin: 0 0 14px;
      padding: 12px 14px;
      border-radius: 12px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      color: #9a3412;
      font-size: 13px;
    }
    .table-card {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: auto;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      min-width: 720px;
      font-size: 13px;
    }
    thead th {
      position: sticky;
      top: 0;
      background: var(--brand);
      color: #fff;
      text-align: left;
      font-weight: 600;
      padding: 12px 14px;
      border-bottom: 1px solid var(--brand-dark);
      white-space: nowrap;
    }
    tbody td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--line);
      vertical-align: middle;
    }
    tbody tr:nth-child(even):not(.row-group):not(.row-totals) td {
      background: var(--soft);
    }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    tr.row-group td {
      background: var(--group);
      font-weight: 600;
    }
    tr.row-totals td {
      background: var(--totals);
      font-weight: 700;
      border-top: 2px solid var(--brand);
    }
    tr.row-section td {
      background: var(--brand-soft);
      font-weight: 700;
    }
    td.bold { font-weight: 700; }
    .footer {
      margin-top: 18px;
      color: var(--muted);
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand-block">
      <p class="brand">${escapeHtml(preview.brandTitle)}</p>
      <h1 class="title">${escapeHtml(preview.title)}</h1>
    </div>
    <a class="download" href="${escapeHtml(blobUrl)}" download="${escapeHtml(preview.fileName)}">Download Excel</a>
  </header>
  <main class="wrap">
    <section class="hero">
      <p class="brand">${escapeHtml(preview.brandTitle)}</p>
      <h2 class="title" style="font-size:22px;margin:4px 0 0">${escapeHtml(preview.title)}</h2>
      ${subtitle}
      <div class="chips">
        <span class="chip">${escapeHtml(preview.generatedAtLabel)}</span>
        ${metaHtml}
      </div>
    </section>
    <section class="filters">
      <h2>Applied filters</h2>
      <ul>${filterHtml}</ul>
    </section>
    ${truncationNotice}
    <section class="table-card">
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </section>
    <p class="footer">Generated from Contract Farming · Full dataset is included in the downloaded workbook</p>
  </main>
</body>
</html>`;
}

function writeLoadingDocument(win: Window) {
  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Preparing export…</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: "Segoe UI", Calibri, system-ui, sans-serif;
      color: #0a2e1a;
      background:
        radial-gradient(900px 360px at 20% 0%, #dcefe4 0%, transparent 55%),
        #f5faf7;
    }
    .card {
      text-align: center;
      padding: 28px 32px;
      border-radius: 16px;
      background: #fff;
      border: 1px solid #c5ddd0;
      box-shadow: 0 10px 30px rgb(1 102 48 / 8%);
    }
    .spinner {
      width: 28px;
      height: 28px;
      margin: 0 auto 14px;
      border-radius: 50%;
      border: 3px solid #dcefe4;
      border-top-color: #016630;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { margin: 0; font-size: 16px; }
    p { margin: 8px 0 0; color: #64748b; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner" aria-hidden="true"></div>
    <h1>Preparing Excel preview</h1>
    <p>Building a branded workbook from your current view…</p>
  </div>
</body>
</html>`);
  win.document.close();
}

function writeErrorDocument(win: Window, message: string) {
  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Export failed</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: "Segoe UI", Calibri, system-ui, sans-serif;
      color: #7f1d1d;
      background: #fef2f2;
    }
    .card {
      max-width: 420px;
      padding: 24px;
      border-radius: 14px;
      background: #fff;
      border: 1px solid #fecaca;
      box-shadow: 0 8px 24px rgb(127 29 29 / 8%);
    }
    h1 { margin: 0 0 8px; font-size: 16px; }
    p { margin: 0; color: #991b1b; font-size: 13px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Could not build preview</h1>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>`);
  win.document.close();
}

export async function openExcelPreviewInNewTab(
  buildExport: () => Promise<ExcelPackage>,
): Promise<void> {
  const previewWindow = window.open('', '_blank');
  if (!previewWindow) {
    throw new Error('Pop-up blocked. Allow pop-ups to open the Excel preview.');
  }

  writeLoadingDocument(previewWindow);

  try {
    const { buffer, fileName, preview } = await buildExport();
    revokeLastPreviewBlobUrl();
    const blobUrl = URL.createObjectURL(new Blob([buffer], { type: XLSX_MIME }));
    lastPreviewBlobUrl = blobUrl;

    previewWindow.document.open();
    previewWindow.document.write(buildPreviewDocumentHtml({ ...preview, fileName }, blobUrl));
    previewWindow.document.close();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error while building the export.';
    writeErrorDocument(previewWindow, message);
    throw error;
  }
}
