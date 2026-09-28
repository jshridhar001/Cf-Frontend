import { isAxiosError } from 'axios';
import { FileTextIcon, ImageIcon, UploadIcon, XIcon } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
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
import { Spinner } from '@/components/ui/spinner';
import { useUploadSeedRequisitionContract } from '@/features/seed-requisition/overview/api/use-upload-seed-requisition-contract';
import { getApiErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { AgreementLanguage } from '../content/types';

const UPLOAD_FAILED = 'Failed to upload contract.';
const MAX_CONTRACT_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES =
  '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp';

function isAllowedContractFile(file: File) {
  const type = file.type.toLowerCase();
  if (['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(type)) return true;
  return /\.(pdf|jpe?g|png|webp)$/i.test(file.name);
}

function fileKind(file: File) {
  const name = file.name.toLowerCase();
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'PDF';
  if (file.type === 'image/png' || name.endsWith('.png')) return 'PNG';
  if (file.type === 'image/webp' || name.endsWith('.webp')) return 'WebP';
  return 'JPEG';
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function contractFileError(file: File) {
  if (file.size === 0) return 'File is required.';
  if (file.size > MAX_CONTRACT_FILE_BYTES) return 'File must be 10MB or smaller.';
  if (!isAllowedContractFile(file)) return 'Only PDF, JPEG, PNG, or WebP files can be uploaded.';
  return null;
}

function ContractUploadDialog({
  requisitionId,
  language,
  url,
}: {
  requisitionId: string;
  language: AgreementLanguage;
  url: string | null;
}) {
  const upload = useUploadSeedRequisitionContract();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const label = language === 'hi' ? 'Hindi' : 'English';
  const shortLabel = language === 'hi' ? 'हि' : 'EN';
  const isUploading = upload.isPending;

  function openFilePicker() {
    inputRef.current?.click();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!next) return;
    const error = contractFileError(next);
    if (error) {
      setFile(null);
      setLocalError(error);
      return;
    }
    setLocalError(null);
    setFile(next);
  }

  async function uploadSelected() {
    if (!file || isUploading) return;
    setLocalError(null);
    try {
      await upload.mutateAsync({ requisitionId, language, file });
      setFile(null);
    } catch (error) {
      setLocalError(getApiErrorMessage(error, UPLOAD_FAILED));
      if (!isAxiosError(error)) {
        toast.error(getApiErrorMessage(error, UPLOAD_FAILED), { position: 'bottom-right' });
      }
    }
  }

  const state = isUploading ? 'uploading' : localError ? 'error' : file || url ? 'done' : 'idle';
  const title = file ? file.name : url ? `${label} contract` : 'Choose a file';
  const description = isUploading
    ? 'Uploading…'
    : localError
      ? localError
      : file
        ? `${fileKind(file)} · ${formatFileSize(file.size)}`
        : url
          ? 'On Google Drive'
          : 'PDF, JPEG, PNG, or WebP · up to 10MB';

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 px-3 md:hidden"
        aria-label={`Upload ${label} contract`}
        onClick={() => setOpen(true)}
      >
        <UploadIcon />
        {shortLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="hidden md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <UploadIcon />
        Upload {label}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && isUploading) return;
          setOpen(next);
          if (!next) {
            setFile(null);
            setLocalError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {label} contract</DialogTitle>
            <DialogDescription>
              Choose a PDF, JPEG, PNG, or WebP from your computer, then upload it to Google Drive.
            </DialogDescription>
          </DialogHeader>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="sr-only"
            aria-label={`Choose ${label} contract file`}
            onChange={onFileChange}
          />
          <Attachment state={state} className="w-full max-w-full">
            <AttachmentMedia>
              {isUploading ? (
                <Spinner />
              ) : file?.type.startsWith('image/') ? (
                <ImageIcon />
              ) : (
                <FileTextIcon />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{title}</AttachmentTitle>
              <AttachmentDescription>{description}</AttachmentDescription>
            </AttachmentContent>
            {file && !isUploading ? (
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
                  size="icon"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => {
                    setFile(null);
                    setLocalError(null);
                  }}
                >
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            ) : null}
            {!file && url && !isUploading ? (
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
                  size="icon"
                  aria-label={`Choose a different ${label} contract file`}
                  onClick={openFilePicker}
                >
                  <UploadIcon />
                </AttachmentAction>
              </AttachmentActions>
            ) : null}
            {state === 'idle' || (state === 'error' && !file) ? (
              <AttachmentTrigger
                aria-label={`Choose ${label} contract file`}
                onClick={openFilePicker}
              />
            ) : null}
            {!file && url && !localError && !isUploading ? (
              <AttachmentTrigger asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  <span className="sr-only">Open {label} contract on Google Drive</span>
                </a>
              </AttachmentTrigger>
            ) : null}
          </Attachment>
          <DialogFooter>
            <Button
              type="button"
              disabled={!file || isUploading}
              onClick={() => {
                void uploadSelected();
              }}
            >
              {isUploading ? 'Uploading…' : 'Upload to Google Drive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ContractUploadActions({
  requisitionId,
  engContractUrl,
  hindiContractUrl,
  className,
}: {
  requisitionId: string;
  engContractUrl: string | null;
  hindiContractUrl: string | null;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <ContractUploadDialog requisitionId={requisitionId} language="en" url={engContractUrl} />
      <ContractUploadDialog requisitionId={requisitionId} language="hi" url={hindiContractUrl} />
    </div>
  );
}
