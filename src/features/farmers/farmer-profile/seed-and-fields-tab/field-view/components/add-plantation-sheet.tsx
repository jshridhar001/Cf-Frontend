import { useForm } from '@tanstack/react-form';
import { ImagePlus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
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
import { useCreatePlantation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-create-plantation';
import { useUpdatePlantation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-update-plantation';
import type { Plantation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';
import { useSeedSizes } from '@/features/master/api/use-seed-sizes';
import { useVarieties } from '@/features/master/api/use-varieties';
import { ActivityImageUploadError, uploadActivityImages } from '@/lib/upload-activity-images';

const MAX_PLANTATION_PHOTOS = 8;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function createPlantationFormSchema(fieldAcres: number | null) {
  return z
    .object({
      varietyId: z.string().min(1, 'Select a variety.'),
      seedSizeId: z.string().min(1, 'Select a seed size.'),
      bagsUsed: z
        .string()
        .trim()
        .min(1, 'Enter the bags used.')
        .regex(/^[1-9]\d*$/, 'Enter a whole number greater than 0.'),
      acresPlanted: z
        .string()
        .trim()
        .min(1, 'Enter the acres planted.')
        .refine((value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0, {
          message: 'Enter a number greater than 0.',
        }),
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
      if (fieldAcres == null || !/^\d+(\.\d{1,2})?$/.test(value.acresPlanted)) return;
      if (Number(value.acresPlanted) > fieldAcres) {
        ctx.addIssue({
          code: 'custom',
          path: ['acresPlanted'],
          message: 'Planted acres cannot exceed the field acres.',
        });
      }
    });
}

type PlantationPhoto = {
  id: string;
  url: string;
  file: File | null;
  remoteUrl: string | null;
};

function photosFromPlantation(plantation: Plantation | null): PlantationPhoto[] {
  return (plantation?.mediaUrls ?? []).map((url, index) => ({
    id: `${plantation?.id ?? 'photo'}-${index}`,
    url,
    file: null,
    remoteUrl: url,
  }));
}

function formDefaults(plantation: Plantation | null) {
  const acres = plantation ? Number(plantation.acresPlanted) : Number.NaN;
  return {
    varietyId: plantation?.varietyId ?? '',
    seedSizeId: plantation?.sizeId ?? '',
    bagsUsed: plantation ? String(plantation.bagCount) : '',
    acresPlanted: Number.isFinite(acres) ? acres.toFixed(2) : '',
    startDate: plantation?.startDate ?? '',
    endDate: plantation?.endDate ?? '',
    remarks: plantation?.remarks ?? '',
  };
}

function sanitizeBagsInput(raw: string) {
  return raw.replace(/\D/g, '');
}

function sanitizeAcresInput(raw: string) {
  const value = raw.replace(/[^\d.]/g, '');
  const firstDot = value.indexOf('.');
  if (firstDot === -1) return value;
  const integer = value.slice(0, firstDot);
  const fraction = value
    .slice(firstDot + 1)
    .replace(/\./g, '')
    .slice(0, 2);
  return `${integer}.${fraction}`;
}

export function AddPlantationSheet({
  fieldId,
  fieldAcres,
  plantation = null,
  open,
  onOpenChange,
}: {
  fieldId: string;
  fieldAcres: string;
  plantation?: Plantation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = plantation != null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:w-full data-[side=right]:max-w-none data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="pr-12">
          <SheetTitle>{editing ? 'Edit plantation' : 'Add plantation'}</SheetTitle>
          <SheetDescription>
            {editing
              ? 'Update variety, seed size, and planting details for this field.'
              : 'Record variety, seed size, and planting details for this field.'}
          </SheetDescription>
        </SheetHeader>
        {open ? (
          <AddPlantationForm
            key={plantation?.id ?? 'new'}
            fieldId={fieldId}
            fieldAcres={fieldAcres}
            plantation={plantation}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function parseFieldAcres(acres: string) {
  const value = Number(acres);
  return Number.isFinite(value) ? value : null;
}

function AddPlantationForm({
  fieldId,
  fieldAcres,
  plantation,
  onOpenChange,
}: {
  fieldId: string;
  fieldAcres: string;
  plantation: Plantation | null;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = plantation != null;
  const { data: varietyRecords, isPending: varietiesPending } = useVarieties();
  const { mutateAsync: createPlantation } = useCreatePlantation();
  const { mutateAsync: updatePlantation } = useUpdatePlantation();
  const [varietyId, setVarietyId] = useState(plantation?.varietyId ?? '');
  const [attempted, setAttempted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<PlantationPhoto[]>(() => photosFromPlantation(plantation));
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photosRef = useRef(photos);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const bindSheet = useCallback((node: HTMLFormElement | null) => {
    const next = node?.closest<HTMLElement>('[data-slot="sheet-content"]') ?? null;
    setPortalContainer((current) => (current === next ? current : next));
  }, []);
  photosRef.current = photos;
  const parsedFieldAcres = parseFieldAcres(fieldAcres);
  const formSchema = useMemo(
    () => createPlantationFormSchema(parsedFieldAcres),
    [parsedFieldAcres],
  );

  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) {
        if (photo.file) URL.revokeObjectURL(photo.url);
      }
    };
  }, []);

  const form = useForm({
    defaultValues: formDefaults(plantation),
    validators: { onSubmit: formSchema },
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
            'plantationImage',
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
                  ? 'Could not upload every photo. The plantation was not updated.'
                  : 'Could not upload every photo. The plantation was not created.'
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
      const details = {
        varietyId: value.varietyId,
        sizeId: value.seedSizeId,
        bagCount: Number(value.bagsUsed),
        acresPlanted: Number(value.acresPlanted),
        startDate: value.startDate,
        endDate: value.endDate,
      };

      try {
        if (plantation) {
          await updatePlantation({
            id: plantation.id,
            ...details,
            remarks: remarks || null,
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
          });
        } else {
          await createPlantation({
            fieldId,
            ...details,
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

  const { data: seedSizeRecords, isPending: seedSizesPending } = useSeedSizes(varietyId, {
    enabled: Boolean(varietyId),
  });

  function addPhotos(fileList: FileList | null) {
    if (!fileList?.length) return;
    const room = MAX_PLANTATION_PHOTOS - photos.length;
    const accepted: PlantationPhoto[] = [];
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
        <form.Field name="varietyId">
          {(field) => {
            const isInvalid =
              (field.state.meta.isTouched || attempted) && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Variety</FieldLabel>
                <SearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    setVarietyId(value);
                    if (value !== field.state.value) form.setFieldValue('seedSizeId', '');
                  }}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select variety"
                  emptyMessage="No varieties found"
                  disabled={varietiesPending}
                  options={(varietyRecords ?? []).map((variety) => ({
                    id: variety.id,
                    label: variety.name,
                  }))}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="seedSizeId">
          {(field) => {
            const isInvalid =
              (field.state.meta.isTouched || attempted) && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Seed size</FieldLabel>
                <SearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select seed size"
                  emptyMessage={varietyId ? 'No seed sizes found' : 'Select a variety first'}
                  disabled={!varietyId || seedSizesPending}
                  options={(seedSizeRecords ?? []).map((seedSize) => ({
                    id: seedSize.id,
                    label: seedSize.name,
                  }))}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="bagsUsed">
            {(field) => {
              const isInvalid =
                (field.state.meta.isTouched || attempted) && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Bags used</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    inputMode="numeric"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(sanitizeBagsInput(event.target.value))}
                    aria-invalid={isInvalid}
                    placeholder="e.g. 62"
                    autoComplete="off"
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="acresPlanted">
            {(field) => {
              const isInvalid =
                (field.state.meta.isTouched || attempted) && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Acres planted</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    inputMode="decimal"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(sanitizeAcresInput(event.target.value))}
                    aria-invalid={isInvalid}
                    placeholder="e.g. 4.50"
                    autoComplete="off"
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>
        </div>

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
              {photos.length}/{MAX_PLANTATION_PHOTOS}
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
            disabled={photos.length >= MAX_PLANTATION_PHOTOS || uploading}
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
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {uploading
              ? 'Uploading photos…'
              : isSubmitting
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Add plantation'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
