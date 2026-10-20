import { FileTextIcon, MapPin, XIcon } from 'lucide-react';
import { useId, useRef, useState } from 'react';
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
import type { FieldFeatureCollection } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/geo-types';
import { parseKmlText } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/parse-geo-location';

export type BoundaryUploadMeta = {
  name: string;
  size: number;
};

type BoundaryUploadCardProps = {
  id?: string;
  disabled?: boolean;
  onParsed: (data: FieldFeatureCollection, meta: BoundaryUploadMeta) => void;
  onError: (message: string, meta: BoundaryUploadMeta) => void;
  onClear: () => void;
  fileMeta: BoundaryUploadMeta | null;
  error: string | null;
};

type UploadState = 'idle' | 'processing' | 'error' | 'done';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BoundaryUploadCard({
  id,
  disabled = false,
  onParsed,
  onError,
  onClear,
  fileMeta,
  error,
}: BoundaryUploadCardProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const state: UploadState = isProcessing
    ? 'processing'
    : error
      ? 'error'
      : fileMeta
        ? 'done'
        : 'idle';

  async function handleFile(file: File | undefined) {
    if (!file || disabled) return;

    const meta: BoundaryUploadMeta = { name: file.name, size: file.size };
    setIsProcessing(true);

    try {
      const text = await file.text();
      const parsed = parseKmlText(text);
      if (!parsed.success || parsed.value.kind !== 'geojson') {
        onError(
          !parsed.success ? parsed.error : 'KML must include at least one polygon boundary.',
          meta,
        );
        return;
      }

      onParsed(parsed.value.data, meta);
    } catch {
      onError('Failed to read KML file.', meta);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".kml,application/vnd.google-earth.kml+xml"
        className="sr-only"
        disabled={disabled || isProcessing}
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
        }}
      />

      <Attachment state={state} className="w-full">
        <AttachmentMedia>{state === 'idle' ? <MapPin /> : <FileTextIcon />}</AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>
            {fileMeta?.name ?? (state === 'processing' ? 'Parsing KML…' : 'Upload KML')}
          </AttachmentTitle>
          <AttachmentDescription>
            {error
              ? error
              : fileMeta
                ? fileMeta.size > 0
                  ? `KML · ${formatBytes(fileMeta.size)}`
                  : 'Saved plot boundary'
                : 'Plot boundary · .kml'}
          </AttachmentDescription>
        </AttachmentContent>
        {fileMeta || error ? (
          <AttachmentActions>
            <AttachmentAction
              type="button"
              aria-label={fileMeta ? `Remove ${fileMeta.name}` : 'Clear KML upload'}
              disabled={disabled || isProcessing}
              onClick={() => {
                onClear();
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        ) : (
          <AttachmentTrigger
            aria-label="Choose a KML file"
            disabled={disabled || isProcessing}
            onClick={() => inputRef.current?.click()}
          />
        )}
      </Attachment>

      {fileMeta || error ? (
        <button
          type="button"
          className="w-fit text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          disabled={disabled || isProcessing}
          onClick={() => inputRef.current?.click()}
        >
          Choose a different file
        </button>
      ) : null}
    </div>
  );
}
