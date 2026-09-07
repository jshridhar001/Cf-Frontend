import { pdf } from '@react-pdf/renderer';
import { CloudUpload, Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AgreementHtmlPreview } from '@/features/farmer-profile/components/agreement-html-preview';
import { FarmerContractDocument } from '@/features/farmer-profile/components/farmer-contract-document';
import { UploadContractToDriveDialog } from '@/features/farmer-profile/components/upload-contract-to-drive-dialog';
import { buildAgreementContext } from '@/features/farmers/lib/farmer-contract';
import type { Farmer, FarmerContract } from '@/features/farmers/types';

function slugPart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'contract'
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function GeneratedContractPdf({
  farmer,
  contract,
}: {
  farmer: Farmer;
  contract: FarmerContract;
}) {
  const context = useMemo(() => buildAgreementContext(farmer, contract), [farmer, contract]);
  const pdfDocument = useMemo(() => <FarmerContractDocument context={context} />, [context]);
  const fileName = `${slugPart(farmer.name)}-${slugPart(contract.variety)}-potato-multiplication.pdf`;

  const [blob, setBlob] = useState<Blob | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBlob(null);

    void pdf(pdfDocument)
      .toBlob()
      .then((nextBlob) => {
        if (!cancelled) setBlob(nextBlob);
      })
      .catch(() => {
        if (!cancelled) setBlob(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pdfDocument]);

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
      <div className="flex justify-end gap-1">
        <Button
          type="button"
          size="icon"
          className="min-h-11 min-w-11 md:hidden"
          aria-label="Download PDF"
          disabled={!blob}
          onClick={() => {
            if (blob) downloadBlob(blob, fileName);
          }}
        >
          <Download />
        </Button>
        <Button
          type="button"
          size="sm"
          className="hidden md:inline-flex"
          disabled={!blob}
          onClick={() => {
            if (blob) downloadBlob(blob, fileName);
          }}
        >
          <Download data-icon="inline-start" />
          Download PDF
        </Button>
        <Button
          type="button"
          size="icon"
          className="min-h-11 min-w-11 md:hidden"
          aria-label="Upload to Google Drive"
          onClick={() => setUploadOpen(true)}
        >
          <CloudUpload />
        </Button>
        <Button
          type="button"
          size="sm"
          className="hidden md:inline-flex"
          onClick={() => setUploadOpen(true)}
        >
          <CloudUpload data-icon="inline-start" />
          Upload to Google Drive
        </Button>
      </div>

      <UploadContractToDriveDialog
        farmerId={farmer.id}
        contractId={contract.id}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <div className="h-[70vh] min-h-[24rem] w-full overflow-y-auto rounded-md border sm:min-h-[36rem]">
        <AgreementHtmlPreview context={context} />
      </div>
    </div>
  );
}
