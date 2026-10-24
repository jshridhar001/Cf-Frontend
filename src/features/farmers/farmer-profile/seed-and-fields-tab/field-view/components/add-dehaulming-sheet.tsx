import { useForm } from '@tanstack/react-form';
import { ImagePlus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  DatePickerInput,
  formatDateOnlyString,
  parseDateOnlyString,
} from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDehaulming } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-create-dehaulming';
import { useUpdateDehaulming } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-update-dehaulming';
import type { Dehaulming } from '@/features/farmers/farmer-profile/seed-and-fields-tab/dehaulming-types';
import { ActivityImageUploadError, uploadActivityImages } from '@/lib/upload-activity-images';

const MAX_DEHAULMING_PHOTOS = 8;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const dehaulmingFormSchema = z
  .object({
    startDate: z.string().min(1, 'Select a start date.'),
    endDate: z.string().min(1, 'Select an end date.'),
    remarks: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must be on or after the start date.',
      });
    }
  });

type DehaulmingPhoto = {
  id: string;
  url: string;
  file: File | null;
  remoteUrl: string | null;
};

function photosFromDehaulming(dehaulming: Dehaulming | null): DehaulmingPhoto[] {
  return (dehaulming?.mediaUrls ?? []).map((url, index) => ({
    id: `${dehaulming?.id ?? 'photo'}-${index}`,
    url,
    file: null,
    remoteUrl: url,
  }));
}

function formDefaults(dehaulming: Dehaulming | null) {
  return {
    startDate: dehaulming?.startDate ?? '',
    endDate: dehaulming?.endDate ?? '',
    remarks: dehaulming?.remarks ?? '',
  };
}

export function AddDehaulmingSheet({
  fieldId,
  dehaulming = null,
  open,
  onOpenChange,
}: {
  fieldId: string;
  dehaulming?: Dehaulming | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = dehaulming != null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:w-full data-[side=right]:max-w-none data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="pr-12">
          <SheetTitle>{editing ? 'Edit dehaulming' : 'Add dehaulming'}</SheetTitle>
          <SheetDescription>Record a haulm-removal pass for this plot.</SheetDescription>
        </SheetHeader>
        {open ? (
          <AddDehaulmingForm
            key={dehaulming?.id ?? 'new-dehaulming'}
            fieldId={fieldId}
            dehaulming={dehaulming}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function AddDehaulmingForm({
  fieldId,
  dehaulming,
  onOpenChange,
}: {
  fieldId: string;
  dehaulming: Dehaulming | null;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = dehaulming != null;
  const { mutateAsync: createDehaulming } = useCreateDehaulming();
  const { mutateAsync: updateDehaulming } = useUpdateDehaulming();
  const [attempted, setAttempted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<DehaulmingPhoto[]>(() => photosFromDehaulming(dehaulming));
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photosRef = useRef(photos);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const bindSheet = useCallback((node: HTMLFormElement | null) => {
    const next = node?.closest<HTMLElement>('[data-slot="sheet-content"]') ?? null;
    setPortalContainer((current) => (current === next ? current : next));
  }, []);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) {
        if (photo.file) URL.revokeObjectURL(photo.url);
      }
    };
  }, []);

  const form = useForm({
    defaultValues: formDefaults(dehaulming),
    validators: { onSubmit: dehaulmingFormSchema },
    onSubmit: async ({ value }) => {
      const selectedPhotos = photosRef.current;
      const keptUrls = selectedPhotos.flatMap((photo) =>
        photo.remoteUrl ? [photo.remoteUrl] : [],
      );
      const newPhotos = selectedPhotos.filter((photo) => photo.file);
      let uploadedUrls: string[] = [];

      if (newPhotos.length > 0) {
        setUploading(true);
        try {
          uploadedUrls = await uploadActivityImages(
            'dehaulmingImage',
            newPhotos.flatMap((photo) => (photo.file ? [photo.file] : [])),
          );
        } catch (error) {
          const signedOut =
            error instanceof ActivityImageUploadError && error.reason === 'signed-out';
          const incomplete =
            error instanceof ActivityImageUploadError && error.reason === 'incomplete';
          toast.error(
            signedOut
              ? 'You must be signed in to add photos.'
              : incomplete
                ? editing
                  ? 'Could not upload every photo. The dehaulming was not updated.'
                  : 'Could not upload every photo. The dehaulming was not created.'
                : error instanceof Error
                  ? error.message
                  : 'Failed to upload photos.',
            { position: 'bottom-right' },
          );
          return;
        } finally {
          setUploading(false);
        }
      }

      const remarks = value.remarks.trim();
      const mediaUrls = [...keptUrls, ...uploadedUrls];
      const dates = {
        startDate: value.startDate,
        endDate: value.endDate,
      };

      try {
        if (dehaulming) {
          await updateDehaulming({
            id: dehaulming.id,
            ...dates,
            remarks: remarks || null,
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
          });
        } else {
          await createDehaulming({
            fieldId,
            ...dates,
            ...(remarks ? { remarks } : {}),
            ...(mediaUrls.length > 0 ? { mediaUrls } : {}),
          });
        }
        onOpenChange(false);
      } catch {
        // Error toast is handled by the mutation.
      }
    },
  });

  function addPhotos(fileList: FileList | null) {
    if (!fileList?.length) return;
    const room = MAX_DEHAULMING_PHOTOS - photos.length;
    const accepted: DehaulmingPhoto[] = [];
    let rejected = false;
    let overLimit = false;

    for (const file of fileList) {
      if (accepted.length >= room) {
        overLimit = true;
        break;
      }
      if (!ACCEPTED_PHOTO_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES) {
        rejected = true;
        continue;
      }
      accepted.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        remoteUrl: null,
      });
    }

    if (accepted.length > 0) setPhotos((current) => [...current, ...accepted]);
    if (rejected) {
      setPhotoError('Only JPEG, PNG, or WebP files up to 8 MB are allowed.');
    } else if (overLimit) {
      setPhotoError('You can add up to 8 photos.');
    } else {
      setPhotoError(null);
    }
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === id);
      if (photo?.file) URL.revokeObjectURL(photo.url);
      return current.filter((item) => item.id !== id);
    });
    setPhotoError(null);
  }

  return (
    <form
      ref={bindSheet}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6"
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="gap-6">
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="startDate">
            {(field) => {
              const isInvalid =
                (field.state.meta.isTouched || attempted) && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <DatePickerInput
                    id={field.name}
                    label="Start date"
                    placeholder="Select date"
                    value={field.state.value ? parseDateOnlyString(field.state.value) : undefined}
                    aria-invalid={isInvalid}
                    portalContainer={portalContainer}
                    onChange={(date) => field.handleChange(date ? formatDateOnlyString(date) : '')}
                    onBlur={field.handleBlur}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="endDate">
            {(field) => {
              const isInvalid =
                (field.state.meta.isTouched || attempted) && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <DatePickerInput
                    id={field.name}
                    label="End date"
                    placeholder="Select date"
                    value={field.state.value ? parseDateOnlyString(field.state.value) : undefined}
                    aria-invalid={isInvalid}
                    portalContainer={portalContainer}
                    onChange={(date) => field.handleChange(date ? formatDateOnlyString(date) : '')}
                    onBlur={field.handleBlur}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="remarks">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Remarks (optional)</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Optional notes"
              />
            </Field>
          )}
        </form.Field>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <FieldLabel>Photos</FieldLabel>
            <span className="text-sm text-muted-foreground">
              {photos.length}/{MAX_DEHAULMING_PHOTOS}
            </span>
          </div>
          {photos.length > 0 ? (
            <ul className="grid grid-cols-4 gap-2">
              {photos.map((photo) => (
                <li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl">
                  <img src={photo.url} alt="" className="size-full object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    className="absolute top-1 right-1"
                    aria-label={photo.file ? `Remove ${photo.file.name}` : 'Remove photo'}
                    onClick={() => removePhoto(photo.id)}
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => {
              addPhotos(event.target.files);
              event.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            disabled={photos.length >= MAX_DEHAULMING_PHOTOS || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus />
            Add photos
          </Button>
          <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP up to 8 MB each.</p>
          {photoError ? <p className="text-sm text-destructive">{photoError}</p> : null}
        </div>
      </FieldGroup>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting || uploading}>
            {uploading
              ? 'Uploading photos…'
              : isSubmitting
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Add dehaulming'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
