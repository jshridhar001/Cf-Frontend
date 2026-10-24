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
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useCreateRouging } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-create-rouging';
import { useUpdateRouging } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-update-rouging';
import type { Rouging } from '@/features/farmers/farmer-profile/seed-and-fields-tab/rouging-types';
import { ActivityImageUploadError, uploadActivityImages } from '@/lib/upload-activity-images';

const MAX_ROUGING_PHOTOS = 8;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PLANT_COUNT_DECIMALS = 3;
const ACCEPTED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const plantCount = z.string().refine((value) => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^\d+(\.\d{1,3})?$/.test(trimmed);
}, 'Enter a number, 0 or greater, with up to 3 decimal places.');

const rougingFormSchema = z
  .object({
    startDate: z.string().min(1, 'Select a start date.'),
    endDate: z.string().min(1, 'Select an end date.'),
    virusInfectedPlantsRemoved: plantCount,
    offVarietyTypeRemoval: plantCount,
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

type RougingPhoto = {
  id: string;
  url: string;
  file: File | null;
  remoteUrl: string | null;
};

function photosFromRouging(rouging: Rouging | null): RougingPhoto[] {
  return (rouging?.mediaUrls ?? []).map((url, index) => ({
    id: `${rouging?.id ?? 'photo'}-${index}`,
    url,
    file: null,
    remoteUrl: url,
  }));
}

function countFieldValue(value: string | null | undefined) {
  if (value == null || value.trim() === '') return '';
  const amount = Number(value);
  return Number.isFinite(amount) ? String(amount) : value;
}

function formDefaults(rouging: Rouging | null) {
  return {
    startDate: rouging?.startDate ?? '',
    endDate: rouging?.endDate ?? '',
    virusInfectedPlantsRemoved: countFieldValue(rouging?.virusInfectedPlantsRemoved),
    offVarietyTypeRemoval: countFieldValue(rouging?.offVarietyTypeRemoval),
    remarks: rouging?.remarks ?? '',
  };
}

function sanitizePlantCountInput(raw: string) {
  const value = raw.replace(/[^\d.]/g, '');
  const firstDot = value.indexOf('.');
  if (firstDot === -1) return value;
  const integer = value.slice(0, firstDot);
  const fraction = value
    .slice(firstDot + 1)
    .replace(/\./g, '')
    .slice(0, PLANT_COUNT_DECIMALS);
  return `${integer}.${fraction}`;
}

function parseCount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return Number(trimmed);
}

export function AddRougingSheet({
  fieldId,
  rouging = null,
  open,
  onOpenChange,
}: {
  fieldId: string;
  rouging?: Rouging | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = rouging != null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:w-full data-[side=right]:max-w-none data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="pr-12">
          <SheetTitle>{editing ? 'Edit rouging' : 'Add rouging'}</SheetTitle>
          <SheetDescription>Record a rouging pass for this plot.</SheetDescription>
        </SheetHeader>
        {open ? (
          <AddRougingForm
            key={rouging?.id ?? 'new-rouging'}
            fieldId={fieldId}
            rouging={rouging}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function AddRougingForm({
  fieldId,
  rouging,
  onOpenChange,
}: {
  fieldId: string;
  rouging: Rouging | null;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = rouging != null;
  const { mutateAsync: createRouging } = useCreateRouging();
  const { mutateAsync: updateRouging } = useUpdateRouging();
  const [attempted, setAttempted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<RougingPhoto[]>(() => photosFromRouging(rouging));
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
    defaultValues: formDefaults(rouging),
    validators: { onSubmit: rougingFormSchema },
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
            'rougingImage',
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
                  ? 'Could not upload every photo. The rouging was not updated.'
                  : 'Could not upload every photo. The rouging was not created.'
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
      const virusInfectedPlantsRemoved = parseCount(value.virusInfectedPlantsRemoved);
      const offVarietyTypeRemoval = parseCount(value.offVarietyTypeRemoval);
      const dates = {
        startDate: value.startDate,
        endDate: value.endDate,
      };

      try {
        if (rouging) {
          await updateRouging({
            id: rouging.id,
            ...dates,
            virusInfectedPlantsRemoved,
            offVarietyTypeRemoval,
            remarks: remarks || null,
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
          });
        } else {
          await createRouging({
            fieldId,
            ...dates,
            ...(virusInfectedPlantsRemoved != null ? { virusInfectedPlantsRemoved } : {}),
            ...(offVarietyTypeRemoval != null ? { offVarietyTypeRemoval } : {}),
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
    const room = MAX_ROUGING_PHOTOS - photos.length;
    const accepted: RougingPhoto[] = [];
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

        <form.Field name="virusInfectedPlantsRemoved">
          {(field) => {
            const isInvalid =
              (field.state.meta.isTouched || attempted) && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Virus-infected plants removed (optional)
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="decimal"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(sanitizePlantCountInput(event.target.value))
                  }
                  aria-invalid={isInvalid}
                  placeholder="0.000"
                  autoComplete="off"
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="offVarietyTypeRemoval">
          {(field) => {
            const isInvalid =
              (field.state.meta.isTouched || attempted) && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Off-variety plants removed (optional)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="decimal"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(sanitizePlantCountInput(event.target.value))
                  }
                  aria-invalid={isInvalid}
                  placeholder="0.000"
                  autoComplete="off"
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

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
              {photos.length}/{MAX_ROUGING_PHOTOS}
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
            disabled={photos.length >= MAX_ROUGING_PHOTOS || uploading}
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
                  : 'Add rouging'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
