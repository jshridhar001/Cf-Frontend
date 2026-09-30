import { type DocumentProps, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { DownloadIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AgreementDocument = ReactElement<DocumentProps>;

const previewFrameClassName = 'h-[min(70dvh,900px)] w-full overflow-hidden rounded-lg border';

function contractPathname(url: string) {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return url.split('?')[0]?.toLowerCase() ?? '';
  }
}

export function isStoredContractImage(url: string) {
  return /\.(jpe?g|png|webp)$/.test(contractPathname(url));
}

const GOOGLE_DOC_KINDS = new Set(['document', 'spreadsheets', 'presentation']);

export function storedContractPreviewSrc(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathId = parsed.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    const queryId = parsed.searchParams.get('id');
    const fileId = pathId || (queryId && /^[a-zA-Z0-9_-]+$/.test(queryId) ? queryId : null);
    if (!fileId || (host !== 'drive.google.com' && host !== 'docs.google.com')) return url;

    const kind = parsed.pathname.split('/').filter(Boolean)[0];
    if (host === 'docs.google.com' && kind && GOOGLE_DOC_KINDS.has(kind)) {
      return `https://docs.google.com/${kind}/d/${fileId}/preview`;
    }

    return `https://drive.google.com/file/d/${fileId}/preview`;
  } catch {
    return url;
  }
}

export function StoredContractPreview({ url, title }: { url: string; title: string }) {
  if (isStoredContractImage(url)) {
    return (
      <div className={previewFrameClassName}>
        <img src={url} alt={title} className="size-full object-contain" />
      </div>
    );
  }

  return (
    <div className={previewFrameClassName}>
      <iframe title={title} src={storedContractPreviewSrc(url)} className="size-full border-0" />
    </div>
  );
}

export function StoredContractDownload({
  url,
  className,
  labeled,
}: {
  url: string;
  className?: string;
  labeled: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Download agreement"
      className={cn(buttonVariants({ size: labeled ? 'default' : 'icon' }), className)}
    >
      <DownloadIcon />
      {labeled ? 'Download' : null}
    </a>
  );
}

export function AgreementPreview({ document }: { document: AgreementDocument }) {
  return (
    <div className={previewFrameClassName}>
      <PDFViewer width="100%" height="100%" className="size-full border-0" showToolbar>
        {document}
      </PDFViewer>
    </div>
  );
}

export function AgreementDownload({
  document,
  fileName,
  className,
  labeled,
}: {
  document: AgreementDocument;
  fileName: string;
  className?: string;
  labeled: boolean;
}) {
  return (
    <PDFDownloadLink
      document={document}
      fileName={fileName}
      aria-label="Download agreement"
      className={cn(buttonVariants({ size: labeled ? 'default' : 'icon' }), className)}
    >
      {({ loading }) => (
        <>
          <DownloadIcon />
          {labeled ? (loading ? 'Preparing…' : 'Download') : null}
        </>
      )}
    </PDFDownloadLink>
  );
}
