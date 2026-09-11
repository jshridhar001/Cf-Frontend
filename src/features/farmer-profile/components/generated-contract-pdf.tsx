import { pdf } from '@react-pdf/renderer';
import { CloudUpload, Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AgreementHtmlPreview } from '@/features/farmer-profile/components/agreement-html-preview';
import { FarmerContractDocument } from '@/features/farmer-profile/components/farmer-contract-document';
import { UploadContractToDriveDialog } from '@/features/farmer-profile/components/upload-contract-to-drive-dialog';
import type { ContractLanguage } from '@/features/farmers/lib/contract-language';
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
  language,
}: {
  farmer: Farmer;
  contract: FarmerContract;
  language: ContractLanguage;
}) {
  const context = useMemo(() => buildAgreementContext(farmer, contract), [farmer, contract]);
  const pdfDocument = useMemo(
    () => <FarmerContractDocument context={context} language={language} />,
    [context, language],
  );
  const langSuffix = language === 'hindi' ? '-hi' : '';
  const fileName = `${slugPart(farmer.name)}-${slugPart(contract.variety)}-potato-multiplication${langSuffix}.pdf`;

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

  const downloadLabel = language === 'hindi' ? 'Download Hindi PDF' : 'Download PDF';
  const uploadLabel =
    language === 'hindi' ? 'Upload Hindi to Google Drive' : 'Upload to Google Drive';

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
      <div className="flex justify-end gap-1">
        <Button
          type="button"
          size="icon"
          className="min-h-11 min-w-11 md:hidden"
          aria-label={downloadLabel}
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
          {downloadLabel}
        </Button>
        <Button
          type="button"
          size="icon"
          className="min-h-11 min-w-11 md:hidden"
          aria-label={uploadLabel}
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
          {uploadLabel}
        </Button>
      </div>

      <UploadContractToDriveDialog
        farmerId={farmer.id}
        contractId={contract.id}
        language={language}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <div className="h-[70vh] min-h-[24rem] w-full overflow-y-auto rounded-md border sm:min-h-[36rem]">
        <AgreementHtmlPreview context={context} language={language} />
      </div>
    </div>
  );
}
