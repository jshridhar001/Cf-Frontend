import { FileText, XIcon } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@/components/ui/attachment';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUploadFarmerContract } from '@/features/farmers/api/use-upload-farmer-contract';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

function isPdfFile(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

interface UploadContractToDriveDialogProps {
  farmerId: string;
  contractId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadContractToDriveDialog({
  farmerId,
  contractId,
  open,
  onOpenChange,
}: UploadContractToDriveDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: uploadContract, isPending } = useUploadFarmerContract();

  const resetSelection = () => {
    setFile(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const closeDialog = () => {
    resetSelection();
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    if (!nextOpen) resetSelection();
    onOpenChange(nextOpen);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!nextFile) return;

    if (!isPdfFile(nextFile)) {
      setFile(null);
      setErrorMessage('Only PDF files are allowed.');
      return;
    }

    setFile(nextFile);
    setErrorMessage(null);
  };

  const attachmentState = errorMessage ? 'error' : isPending ? 'uploading' : file ? 'done' : 'idle';
  const description = errorMessage ?? (file ? `PDF · ${formatFileSize(file.size)}` : 'PDF only');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Upload to Google Drive</DialogTitle>
          <DialogDescription>Select a PDF to upload for this contract.</DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          disabled={isPending}
          onChange={handleFileChange}
        />

        <Attachment state={attachmentState} className="w-full max-w-none">
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file?.name ?? 'Choose a PDF'}</AttachmentTitle>
            <AttachmentDescription>{description}</AttachmentDescription>
          </AttachmentContent>
          {file && !isPending ? (
            <AttachmentActions>
              <AttachmentAction aria-label={`Remove ${file.name}`} onClick={resetSelection}>
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          ) : !file ? (
            <AttachmentTrigger
              aria-label="Choose a PDF"
              onClick={() => inputRef.current?.click()}
            />
          ) : null}
        </Attachment>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!file || isPending}
            onClick={() => {
              if (!file) return;
              void uploadContract({ farmerId, contractId, file })
                .then(() => closeDialog())
                .catch(() => undefined);
            }}
          >
            {isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
