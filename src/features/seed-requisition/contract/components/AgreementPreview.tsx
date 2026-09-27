import { type DocumentProps, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { DownloadIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AgreementDocument = ReactElement<DocumentProps>;

export function AgreementPreview({ document }: { document: AgreementDocument }) {
  return (
    <div className="h-[min(70dvh,900px)] w-full overflow-hidden rounded-lg border">
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
