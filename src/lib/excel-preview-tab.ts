const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export type ExcelPreviewRow = {
  values: Array<string | number>;
  isGroupedOrAggregatedRow?: boolean;
  isTotalsRow?: boolean;
};

export type ExcelPreviewData = {
  brandTitle: string;
  title: string;
  subtitle: string;
  fileName: string;
  generatedAtLabel: string;
  metaLines: string[];
  filterSummaryLines: string[];
  headers: string[];
  rows: ExcelPreviewRow[];
  totalBodyRowCount: number;
};

export type ExcelPackage = {
  buffer: ArrayBuffer;
  fileName: string;
  preview: ExcelPreviewData;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function bufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function formatCell(value: string | number) {
  if (typeof value === 'number') {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }
  if (!value) return '<span class="muted">—</span>';
  return escapeHtml(value);
}

function statusClass(value: string | number) {
  if (value === 'Approved') return 'status approved';
  if (value === 'Rejected') return 'status rejected';
  if (value === 'Pending') return 'status pending';
  return '';
}

function loadingDocument(title: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #eef1f6; color: #44403c; font-family: "Segoe UI", sans-serif; }
  </style>
</head>
<body>Preparing the report…</body>
</html>`;
}

function renderPreviewDocument(pkg: ExcelPackage) {
  const { preview } = pkg;
  const numericColumns = preview.headers.map((_, index) =>
    preview.rows.some((row) => typeof row.values[index] === 'number'),
  );
  const statusColumn = preview.headers.findIndex((header) => header.toLowerCase() === 'status');
  const downloadHref = `data:${XLSX_MIME};base64,${bufferToBase64(pkg.buffer)}`;
  const filters =
    preview.filterSummaryLines.length > 0
      ? preview.filterSummaryLines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')
      : '<li>No filters applied</li>';
  const meta = preview.metaLines.map((line) => `<span>${escapeHtml(line)}</span>`).join('');
  const head = preview.headers
    .map((header, index) => {
      const align = numericColumns[index] ? ' class="num"' : '';
      return `<th${align}>${escapeHtml(header)}</th>`;
    })
    .join('');
  const body = preview.rows
    .map((row, rowIndex) => {
      const kind = row.isTotalsRow
        ? 'totals'
        : row.isGroupedOrAggregatedRow
          ? 'group'
          : rowIndex % 2 === 1
            ? 'zebra'
            : '';
      const cells = preview.headers
        .map((_, index) => {
          const value = row.values[index] ?? '';
          const status = index === statusColumn ? statusClass(value) : '';
          const content = status
            ? `<span class="${status}">${formatCell(value)}</span>`
            : formatCell(value);
          return `<td${numericColumns[index] ? ' class="num"' : ''}>${content}</td>`;
        })
        .join('');
      return `<tr class="${kind}">${cells}</tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(preview.title)} · ${escapeHtml(preview.fileName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap" rel="stylesheet" />
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(1200px 480px at 10% -10%, rgba(20, 71, 230, 0.16), transparent 55%),
        #eef1f6;
      color: #1c1917;
      font-family: Outfit, "Segoe UI", sans-serif;
    }
    .bar {
      position: sticky;
      top: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 28px;
      background: rgba(255, 255, 255, 0.92);
      border-bottom: 1px solid #e2e8f0;
      backdrop-filter: blur(12px);
    }
    .bar p { margin: 0; color: #78716c; font-size: 13px; }
    .bar strong { color: #1c1917; font-weight: 600; }
    a.download {
      display: inline-flex;
      align-items: center;
      height: 36px;
      padding: 0 16px;
      border-radius: 999px;
      background: #1447e6;
      color: white;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      letter-spacing: 0.01em;
    }
    a.download:hover { background: #0f2f9e; }
    main { width: min(1120px, calc(100% - 40px)); margin: 28px auto 48px; }
    .sheet {
      overflow: hidden;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      box-shadow: 0 24px 60px rgba(15, 47, 158, 0.08);
    }
    .mast {
      padding: 28px 32px 22px;
      background: linear-gradient(135deg, #1447e6 0%, #0f2f9e 100%);
      color: white;
    }
    .eyebrow {
      margin: 0 0 8px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      opacity: 0.82;
    }
    h1 {
      margin: 0;
      font-family: "Source Serif 4", Georgia, serif;
      font-size: 34px;
      font-weight: 560;
      letter-spacing: -0.03em;
    }
    .subtitle { margin: 10px 0 0; max-width: 62ch; color: rgba(255,255,255,0.84); font-size: 14px; line-height: 1.5; }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
    }
    .meta span, .filters li {
      border-radius: 999px;
      background: rgba(255,255,255,0.14);
      padding: 4px 10px;
      font-size: 12px;
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0;
      padding: 16px 32px;
      list-style: none;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      color: #44403c;
      font-size: 13px;
    }
    .filters li { background: white; border: 1px solid #e2e8f0; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 11px 14px; text-align: left; vertical-align: middle; }
    th {
      background: #0f2f9e;
      color: white;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
    td { border-bottom: 1px solid #e2e8f0; }
    tr.zebra td { background: #f8fafc; }
    tr.group td { background: #e8eef9; font-weight: 600; }
    tr.totals td {
      background: #e7f0ff;
      border-top: 2px solid #1447e6;
      font-weight: 650;
    }
    .muted { color: #a8a29e; }
    .status {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
    }
    .status.pending { background: #fff7ed; color: #c2410c; }
    .status.approved { background: #ecfdf3; color: #047857; }
    .status.rejected { background: #fef2f2; color: #b91c1c; }
    footer {
      padding: 14px 32px 18px;
      color: #78716c;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="bar">
    <p><strong>${escapeHtml(preview.brandTitle)}</strong> · ${escapeHtml(preview.generatedAtLabel)} · ${escapeHtml(preview.fileName)}</p>
    <a class="download" href="${downloadHref}" download="${escapeHtml(preview.fileName)}">Download Excel</a>
  </div>
  <main>
    <article class="sheet">
      <header class="mast">
        <p class="eyebrow">${escapeHtml(preview.brandTitle)}</p>
        <h1>${escapeHtml(preview.title)}</h1>
        <p class="subtitle">${escapeHtml(preview.subtitle)}</p>
        <div class="meta">${meta}</div>
      </header>
      <ul class="filters">${filters}</ul>
      <div class="table-wrap">
        <table>
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
      <footer>${escapeHtml(String(preview.totalBodyRowCount))} rows in this view, including the totals line.</footer>
    </article>
  </main>
</body>
</html>`;
}

function htmlUrl(html: string) {
  return URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
}

export async function openExcelPreviewInNewTab(build: () => Promise<ExcelPackage>) {
  const loadingUrl = htmlUrl(loadingDocument('Seed requisition preview'));
  const previewWindow = window.open(loadingUrl, '_blank');
  if (!previewWindow) {
    URL.revokeObjectURL(loadingUrl);
    throw new Error('Allow pop-ups to preview the Excel report.');
  }

  try {
    const pkg = await build();
    const reportUrl = htmlUrl(renderPreviewDocument(pkg));
    previewWindow.location.replace(reportUrl);
    window.setTimeout(() => URL.revokeObjectURL(loadingUrl), 1000);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not build the Excel preview.';
    const failedUrl = htmlUrl(
      loadingDocument('Preview failed').replace('Preparing the report…', escapeHtml(message)),
    );
    previewWindow.location.replace(failedUrl);
    throw error;
  }
}
