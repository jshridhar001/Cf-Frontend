import { useForm } from '@tanstack/react-form';
import { ImagePlus, Plus, X } from 'lucide-react';
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useCreateStripTestGroup } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-create-strip-test-group';
import { useUpdateStripTestGroup } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-update-strip-test-group';
import {
  type CreateStripTestGroupInput,
  isStripTestType,
  type StripTestGroup,
  type StripTestInput,
  type StripTestType,
  stripTestTypeLabel,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';
import { useTuberSizes } from '@/features/master/api/use-tuber-sizes';
import type { TuberSize } from '@/features/master/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { formatSeedSize } from '@/lib/format-seed-size';
import { ActivityImageUploadError, uploadActivityImages } from '@/lib/upload-activity-images';

const MAX_STRIP_PHOTOS = 8;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DECIMAL = /^(?:0|[1-9]\d*)(?:\.\d{0,3})?$/;

const positiveDecimal = z
  .string()
  .refine(isPositiveDecimal, 'Enter a number greater than 0, with up to 3 decimal places.');
const nonNegativeDecimal = z
  .string()
  .refine(isNonNegativeDecimal, 'Enter a number, 0 or greater, with up to 3 decimal places.');
const positiveInteger = z.string().refine(isPositiveInteger, 'Enter a whole number of at least 1.');
const nonNegativeInteger = z
  .string()
  .refine(isNonNegativeInteger, 'Enter a whole number, 0 or greater.');
const optionalNonNegativeInteger = z
  .string()
  .refine(
    (value) => value === '' || isNonNegativeInteger(value),
    'Enter a whole number, 0 or greater.',
  );

const tuberRecordSchema = z.object({
  key: z.string(),
  tuberSizeId: z.string().min(1, 'Select a tuber size.'),
  quantity: nonNegativeInteger,
  weightKg: nonNegativeDecimal,
});

const stripSchema = z
  .object({
    key: z.string(),
    type: z
      .union([z.literal(''), z.literal('PRE_DEHAULMING'), z.literal('POST_DEHAULMING')])
      .refine((value) => value !== '', 'Select a strip type.'),
    startDate: z.string().min(1, 'Select a start date.'),
    endDate: z.string().min(1, 'Select an end date.'),
    stripLength: positiveDecimal,
    stripWidth: positiveDecimal,
    numberOfPlants: positiveInteger,
    stemsPerPlant: optionalNonNegativeInteger,
    remarks: z.string(),
    tuberRecords: z.array(tuberRecordSchema).min(1, 'Add at least one tuber record.'),
  })
  .superRefine((strip, ctx) => {
    if (strip.startDate && strip.endDate && strip.endDate < strip.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must be on or after the start date.',
      });
    }

    const seen = new Set<string>();
    strip.tuberRecords.forEach((record, index) => {
      if (!record.tuberSizeId) return;
      if (seen.has(record.tuberSizeId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['tuberRecords', index, 'tuberSizeId'],
          message: 'This tuber size is already on this strip.',
        });
        return;
      }
      seen.add(record.tuberSizeId);
    });
  });

const stripTestGroupFormSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0, 'Enter a group name.'),
  stripTests: z.array(stripSchema).min(1, 'Add at least one strip.'),
});

type TuberRecordDraft = {
  key: string;
  tuberSizeId: string;
  quantity: string;
  weightKg: string;
};

type StripDraft = {
  key: string;
  type: '' | StripTestType;
  startDate: string;
  endDate: string;
  stripLength: string;
  stripWidth: string;
  numberOfPlants: string;
  stemsPerPlant: string;
  remarks: string;
  tuberRecords: TuberRecordDraft[];
};

type StripTestGroupFormValues = {
  name: string;
  stripTests: StripDraft[];
};

type StripPhoto = {
  id: string;
  url: string;
  file: File | null;
  remoteUrl: string | null;
};

function isPositiveDecimal(value: string) {
  if (!DECIMAL.test(value)) return false;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
}

function isNonNegativeDecimal(value: string) {
  if (!DECIMAL.test(value)) return false;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0;
}

function isPositiveInteger(value: string) {
  return /^[1-9]\d*$/.test(value);
}

function isNonNegativeInteger(value: string) {
  return /^(?:0|[1-9]\d*)$/.test(value);
}

function decimalFieldValue(value: string | number | null | undefined) {
  if (value == null || value === '') return '';
  const amount = Number(value);
  return Number.isFinite(amount) ? String(amount) : String(value);
}

function integerFieldValue(value: string | number | null | undefined) {
  if (value == null || value === '') return '';
  const amount = Number(value);
  return Number.isFinite(amount) ? String(amount) : String(value);
}

function createKey() {
  return crypto.randomUUID();
}

function emptyTuberRecord(): TuberRecordDraft {
  return { key: createKey(), tuberSizeId: '', quantity: '', weightKg: '' };
}

function emptyStrip(): StripDraft {
  return {
    key: createKey(),
    type: '',
    startDate: '',
    endDate: '',
    stripLength: '',
    stripWidth: '',
    numberOfPlants: '',
    stemsPerPlant: '',
    remarks: '',
    tuberRecords: [emptyTuberRecord()],
  };
}

function formDefaults(group: StripTestGroup | null): StripTestGroupFormValues {
  if (!group) return { name: '', stripTests: [emptyStrip()] };
  return {
    name: group.name,
    stripTests: group.stripTests.map((strip) => ({
      key: strip.id,
      type: strip.type,
      startDate: strip.startDate,
      endDate: strip.endDate,
      stripLength: decimalFieldValue(strip.stripLength),
      stripWidth: decimalFieldValue(strip.stripWidth),
      numberOfPlants: integerFieldValue(strip.numberOfPlants),
      stemsPerPlant: integerFieldValue(strip.stemsPerPlant),
      remarks: strip.remarks ?? '',
      tuberRecords:
        strip.tuberRecords.length > 0
          ? strip.tuberRecords.map((record) => ({
              key: record.id,
              tuberSizeId: record.tuberSizeId,
              quantity: integerFieldValue(record.quantity),
              weightKg: decimalFieldValue(record.weightKg),
            }))
          : [emptyTuberRecord()],
    })),
  };
}

function photosFromGroup(group: StripTestGroup | null): Record<string, StripPhoto[]> {
  if (!group) return {};
  return Object.fromEntries(
    group.stripTests.map((strip) => [
      strip.id,
      (strip.mediaUrls ?? [])
        .filter((url) => url.length > 0)
        .map((url, index) => ({
          id: `${strip.id}-photo-${index}`,
          url,
          file: null,
          remoteUrl: url,
        })),
    ]),
  );
}

function savedTuberNames(group: StripTestGroup | null) {
  const names = new Map<string, string>();
  for (const strip of group?.stripTests ?? []) {
    for (const record of strip.tuberRecords) {
      names.set(record.tuberSizeId, record.tuberSize.name);
    }
  }
  return names;
}

function sanitizeDecimalInput(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const withLeading = cleaned.startsWith('.') ? `0${cleaned}` : cleaned;
  const firstDot = withLeading.indexOf('.');
  if (firstDot === -1) return withLeading.replace(/^0+(?=\d)/, '');
  const integer = withLeading.slice(0, firstDot).replace(/^0+(?=\d)/, '') || '0';
  const fraction = withLeading
    .slice(firstDot + 1)
    .replace(/\./g, '')
    .slice(0, 3);
  return `${integer}.${fraction}`;
}

function sanitizeIntegerInput(raw: string) {
  return raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

function fieldIsInvalid(meta: { isTouched: boolean; isValid: boolean }, attempted: boolean) {
  return (meta.isTouched || attempted) && !meta.isValid;
}

function tuberOptions(
  sizes: TuberSize[],
  records: TuberRecordDraft[],
  currentId: string,
  names: Map<string, string>,
) {
  const taken = new Set(
    records.flatMap((record) =>
      record.tuberSizeId && record.tuberSizeId !== currentId ? [record.tuberSizeId] : [],
    ),
  );
  const options = sizes
    .filter((size) => !taken.has(size.id))
    .map((size) => ({ id: size.id, label: formatSeedSize(size.name) }));
  if (currentId && !options.some((option) => option.id === currentId)) {
    const saved = names.get(currentId);
    options.unshift({
      id: currentId,
      label: saved ? formatSeedSize(saved) : 'Saved tuber size',
    });
  }
  return options;
}

async function mediaUrlsForStrip(photos: StripPhoto[]) {
  const resolved = new Array<string>(photos.length).fill('');
  const pending: Array<{ index: number; file: File }> = [];
  photos.forEach((photo, index) => {
    if (photo.remoteUrl) resolved[index] = photo.remoteUrl;
    else if (photo.file) pending.push({ index, file: photo.file });
  });
  if (pending.length > 0) {
    const uploaded = await uploadActivityImages(
      'stripTestImage',
      pending.map((item) => item.file),
    );
    pending.forEach((item, index) => {
      resolved[item.index] = uploaded[index] ?? '';
    });
  }
  return resolved.filter((url) => url.length > 0);
}

function buildStripTestGroupBody(
  fieldId: string,
  value: StripTestGroupFormValues,
  mediaByStrip: Map<string, string[]>,
): CreateStripTestGroupInput | null {
  const stripTests: StripTestInput[] = [];
  for (const strip of value.stripTests) {
    if (!isStripTestType(strip.type)) return null;
    const mediaUrls = mediaByStrip.get(strip.key) ?? [];
    const remarks = strip.remarks.trim();
    const stems = strip.stemsPerPlant.trim();
    stripTests.push({
      fieldId,
      type: strip.type,
      startDate: strip.startDate,
      endDate: strip.endDate,
      stripLength: Number(strip.stripLength),
      stripWidth: Number(strip.stripWidth),
      numberOfPlants: Number(strip.numberOfPlants),
      ...(stems !== '' ? { stemsPerPlant: Number(stems) } : {}),
      ...(remarks ? { remarks } : {}),
      ...(mediaUrls.length > 0 ? { mediaUrls } : {}),
      tuberRecords: strip.tuberRecords.map((record) => ({
        tuberSizeId: record.tuberSizeId,
        quantity: Number(record.quantity),
        weightKg: Number(record.weightKg),
      })),
    });
  }
  return { fieldId, name: value.name.trim(), stripTests };
}

export function AddStripTestSheet({
  fieldId,
  group = null,
  open,
  onOpenChange,
}: {
  fieldId: string;
  group?: StripTestGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = group != null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:w-full data-[side=right]:max-w-none data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="pr-12">
          <SheetTitle>{editing ? 'Edit strip test' : 'Add strip test'}</SheetTitle>
          <SheetDescription>
            Record the strips and tuber counts for this plot. Two groups on the same plot cannot
            share a name.
          </SheetDescription>
        </SheetHeader>
        {open ? (
          <AddStripTestForm
            key={group?.id ?? 'new-strip-test'}
            fieldId={fieldId}
            group={group}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function AddStripTestForm({
  fieldId,
  group,
  onOpenChange,
}: {
  fieldId: string;
  group: StripTestGroup | null;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = group != null;
  const { mutateAsync: createGroup } = useCreateStripTestGroup();
  const { mutateAsync: updateGroup } = useUpdateStripTestGroup();
  const tuberSizesQuery = useTuberSizes();
  const tuberSizes = tuberSizesQuery.data ?? [];
  const knownTuberNames = useMemo(() => savedTuberNames(group), [group]);
  const [attempted, setAttempted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photosByStrip, setPhotosByStrip] = useState<Record<string, StripPhoto[]>>(() =>
    photosFromGroup(group),
  );
  const [photoErrors, setPhotoErrors] = useState<Record<string, string | null>>({});
  const photosRef = useRef(photosByStrip);
  const photoTargetRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const bindSheet = useCallback((node: HTMLFormElement | null) => {
    const next = node?.closest<HTMLElement>('[data-slot="sheet-content"]') ?? null;
    setPortalContainer((current) => (current === next ? current : next));
  }, []);
  photosRef.current = photosByStrip;

  useEffect(() => {
    return () => {
      for (const photos of Object.values(photosRef.current)) {
        for (const photo of photos) {
          if (photo.file) URL.revokeObjectURL(photo.url);
        }
      }
    };
  }, []);

  const form = useForm({
    defaultValues: formDefaults(group),
    validators: { onSubmit: stripTestGroupFormSchema },
    onSubmit: async ({ value }) => {
      const selected = photosRef.current;
      const needsUpload = value.stripTests.some((strip) =>
        (selected[strip.key] ?? []).some((photo) => photo.file),
      );
      let mediaByStrip: Map<string, string[]>;
      if (needsUpload) setUploading(true);
      try {
        const entries = await Promise.all(
          value.stripTests.map(async (strip) => {
            const urls = await mediaUrlsForStrip(selected[strip.key] ?? []);
            return [strip.key, urls] as const;
          }),
        );
        mediaByStrip = new Map(entries);
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
                ? 'Could not upload every photo. The strip test was not updated.'
                : 'Could not upload every photo. The strip test was not created.'
              : error instanceof Error
                ? error.message
                : 'Failed to upload photos.',
          { position: 'bottom-right' },
        );
        return;
      } finally {
        setUploading(false);
      }

      const body = buildStripTestGroupBody(fieldId, value, mediaByStrip);
      if (!body) {
        toast.error("Couldn't save this strip test. Check the strips and try again.", {
          position: 'bottom-right',
        });
        return;
      }

      try {
        if (group) {
          await updateGroup({ id: group.id, ...body });
        } else {
          await createGroup(body);
        }
        onOpenChange(false);
      } catch {
        // Error toast is handled by the mutation.
      }
    },
  });

  function addPhotos(stripKey: string, fileList: FileList | null) {
    if (!fileList?.length) return;
    const current = photosRef.current[stripKey] ?? [];
    const room = MAX_STRIP_PHOTOS - current.length;
    const accepted: StripPhoto[] = [];
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
        id: createKey(),
        file,
        url: URL.createObjectURL(file),
        remoteUrl: null,
      });
    }

    if (accepted.length > 0) {
      setPhotosByStrip((photos) => ({
        ...photos,
        [stripKey]: [...(photos[stripKey] ?? []), ...accepted],
      }));
    }
    setPhotoErrors((errors) => ({
      ...errors,
      [stripKey]: rejected
        ? 'Only JPEG, PNG, or WebP files up to 8 MB are allowed.'
        : overLimit
          ? 'You can add up to 8 photos.'
          : null,
    }));
  }

  function removePhoto(stripKey: string, photoId: string) {
    setPhotosByStrip((photos) => {
      const photo = (photos[stripKey] ?? []).find((item) => item.id === photoId);
      if (photo?.file) URL.revokeObjectURL(photo.url);
      return {
        ...photos,
        [stripKey]: (photos[stripKey] ?? []).filter((item) => item.id !== photoId),
      };
    });
    setPhotoErrors((errors) => ({ ...errors, [stripKey]: null }));
  }

  function releaseStripPhotos(stripKey: string) {
    for (const photo of photosRef.current[stripKey] ?? []) {
      if (photo.file) URL.revokeObjectURL(photo.url);
    }
    setPhotosByStrip((photos) => {
      const next = { ...photos };
      delete next[stripKey];
      return next;
    });
    setPhotoErrors((errors) => {
      const next = { ...errors };
      delete next[stripKey];
      return next;
    });
  }

  return (
    <form
      ref={bindSheet}
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        void form.handleSubmit();
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
        <FieldGroup className="gap-6">
          <form.Field name="name">
            {(field) => {
              const isInvalid = fieldIsInvalid(field.state.meta, attempted);
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Group name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="North plot pre-dehaulming"
                    autoComplete="off"
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>

          {tuberSizesQuery.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(tuberSizesQuery.error, "Couldn't load tuber sizes.")}
            </p>
          ) : null}
          {tuberSizesQuery.isSuccess && tuberSizes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a tuber size before recording a strip test.
            </p>
          ) : null}

          <form.Field name="stripTests" mode="array">
            {(stripsField) => (
              <div className="flex flex-col gap-5">
                {stripsField.state.value.map((strip, index) => {
                  const photos = photosByStrip[strip.key] ?? [];
                  const canRemove = stripsField.state.value.length > 1;
                  return (
                    <section
                      key={strip.key}
                      className="flex flex-col gap-4 rounded-xl border p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium">Strip {index + 1}</h3>
                        {canRemove ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="min-h-11 px-3 text-destructive hover:text-destructive sm:min-h-8"
                            onClick={() => {
                              releaseStripPhotos(strip.key);
                              stripsField.removeValue(index);
                            }}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>

                      <form.Field name={`stripTests[${index}].type`}>
                        {(field) => {
                          const isInvalid = fieldIsInvalid(field.state.meta, attempted);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldSet className="gap-3" aria-invalid={isInvalid || undefined}>
                                <FieldLegend variant="label" className="mb-0">
                                  Strip type
                                </FieldLegend>
                                <div className="grid grid-cols-2 gap-4">
                                  {(['PRE_DEHAULMING', 'POST_DEHAULMING'] as const).map((type) => (
                                    <Button
                                      key={type}
                                      type="button"
                                      variant={field.state.value === type ? 'default' : 'outline'}
                                      className="h-11"
                                      aria-pressed={field.state.value === type}
                                      onClick={() => {
                                        field.handleChange(type);
                                        field.handleBlur();
                                      }}
                                    >
                                      {stripTestTypeLabel(type)}
                                    </Button>
                                  ))}
                                </div>
                                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                              </FieldSet>
                            </Field>
                          );
                        }}
                      </form.Field>

                      <div className="grid grid-cols-2 gap-4">
                        <form.Field name={`stripTests[${index}].startDate`}>
                          {(field) => {
                            const isInvalid = fieldIsInvalid(field.state.meta, attempted);
                            return (
                              <Field data-invalid={isInvalid}>
                                <DatePickerInput
                                  id={field.name}
                                  label="Start date"
                                  placeholder="Select date"
                                  value={
                                    field.state.value
                                      ? parseDateOnlyString(field.state.value)
                                      : undefined
                                  }
                                  aria-invalid={isInvalid}
                                  portalContainer={portalContainer}
                                  onChange={(date) =>
                                    field.handleChange(date ? formatDateOnlyString(date) : '')
                                  }
                                  onBlur={field.handleBlur}
                                />
                                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                        <form.Field name={`stripTests[${index}].endDate`}>
                          {(field) => {
                            const isInvalid = fieldIsInvalid(field.state.meta, attempted);
                            return (
                              <Field data-invalid={isInvalid}>
                                <DatePickerInput
                                  id={field.name}
                                  label="End date"
                                  placeholder="Select date"
                                  value={
                                    field.state.value
                                      ? parseDateOnlyString(field.state.value)
                                      : undefined
                                  }
                                  aria-invalid={isInvalid}
                                  portalContainer={portalContainer}
                                  onChange={(date) =>
                                    field.handleChange(date ? formatDateOnlyString(date) : '')
                                  }
                                  onBlur={field.handleBlur}
                                />
                                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <form.Field name={`stripTests[${index}].stripLength`}>
                          {(field) => {
                            const isInvalid = fieldIsInvalid(field.state.meta, attempted);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Length</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  inputMode="decimal"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(sanitizeDecimalInput(event.target.value))
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
                        <form.Field name={`stripTests[${index}].stripWidth`}>
                          {(field) => {
                            const isInvalid = fieldIsInvalid(field.state.meta, attempted);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Width</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  inputMode="decimal"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(sanitizeDecimalInput(event.target.value))
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
                      </div>

                      <div className="grid grid-cols-2 items-end gap-4">
                        <form.Field name={`stripTests[${index}].numberOfPlants`}>
                          {(field) => {
                            const isInvalid = fieldIsInvalid(field.state.meta, attempted);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Plants</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  inputMode="numeric"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(sanitizeIntegerInput(event.target.value))
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="1"
                                  autoComplete="off"
                                />
                                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                        <form.Field name={`stripTests[${index}].stemsPerPlant`}>
                          {(field) => {
                            const isInvalid = fieldIsInvalid(field.state.meta, attempted);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Stems per plant (optional)
                                </FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  inputMode="numeric"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(sanitizeIntegerInput(event.target.value))
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="0"
                                  autoComplete="off"
                                />
                                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </div>

                      <form.Field name={`stripTests[${index}].remarks`}>
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

                      <form.Field name={`stripTests[${index}].tuberRecords`} mode="array">
                        {(recordsField) => {
                          const sizesFilled =
                            tuberSizes.length > 0 &&
                            recordsField.state.value.length >= tuberSizes.length;
                          return (
                            <div className="flex flex-col gap-4 border-t pt-4">
                              <FieldTitle>Tuber records</FieldTitle>
                              {recordsField.state.meta.errors.length > 0 && attempted ? (
                                <FieldError errors={recordsField.state.meta.errors} />
                              ) : null}
                              {recordsField.state.value.map((record, recordIndex) => (
                                <div
                                  key={record.key}
                                  className="flex flex-col gap-4 rounded-lg bg-muted/40 p-3"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Record {recordIndex + 1}
                                    </p>
                                    {recordsField.state.value.length > 1 ? (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="min-h-11 px-3 text-destructive hover:text-destructive sm:min-h-8"
                                        onClick={() => recordsField.removeValue(recordIndex)}
                                      >
                                        Remove
                                      </Button>
                                    ) : null}
                                  </div>
                                  <form.Field
                                    name={`stripTests[${index}].tuberRecords[${recordIndex}].tuberSizeId`}
                                  >
                                    {(field) => {
                                      const isInvalid = fieldIsInvalid(field.state.meta, attempted);
                                      return (
                                        <Field data-invalid={isInvalid}>
                                          <FieldLabel htmlFor={field.name}>Tuber size</FieldLabel>
                                          <SearchableOptionCombobox
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={field.handleChange}
                                            onBlur={field.handleBlur}
                                            isInvalid={isInvalid}
                                            placeholder={
                                              tuberSizesQuery.isPending
                                                ? 'Loading tuber sizes…'
                                                : 'Select tuber size'
                                            }
                                            popupSearchPlaceholder="Search tuber sizes"
                                            emptyMessage="No tuber sizes found."
                                            options={tuberOptions(
                                              tuberSizes,
                                              recordsField.state.value,
                                              field.state.value,
                                              knownTuberNames,
                                            )}
                                            disabled={
                                              tuberSizesQuery.isPending || tuberSizes.length === 0
                                            }
                                          />
                                          {isInvalid ? (
                                            <FieldError errors={field.state.meta.errors} />
                                          ) : null}
                                        </Field>
                                      );
                                    }}
                                  </form.Field>
                                  <div className="grid grid-cols-2 items-end gap-4">
                                    <form.Field
                                      name={`stripTests[${index}].tuberRecords[${recordIndex}].quantity`}
                                    >
                                      {(field) => {
                                        const isInvalid = fieldIsInvalid(
                                          field.state.meta,
                                          attempted,
                                        );
                                        return (
                                          <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                                            <Input
                                              id={field.name}
                                              name={field.name}
                                              inputMode="numeric"
                                              value={field.state.value}
                                              onBlur={field.handleBlur}
                                              onChange={(event) =>
                                                field.handleChange(
                                                  sanitizeIntegerInput(event.target.value),
                                                )
                                              }
                                              aria-invalid={isInvalid}
                                              placeholder="0"
                                              autoComplete="off"
                                            />
                                            {isInvalid ? (
                                              <FieldError errors={field.state.meta.errors} />
                                            ) : null}
                                          </Field>
                                        );
                                      }}
                                    </form.Field>
                                    <form.Field
                                      name={`stripTests[${index}].tuberRecords[${recordIndex}].weightKg`}
                                    >
                                      {(field) => {
                                        const isInvalid = fieldIsInvalid(
                                          field.state.meta,
                                          attempted,
                                        );
                                        return (
                                          <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                              Weight (kg)
                                            </FieldLabel>
                                            <Input
                                              id={field.name}
                                              name={field.name}
                                              inputMode="decimal"
                                              value={field.state.value}
                                              onBlur={field.handleBlur}
                                              onChange={(event) =>
                                                field.handleChange(
                                                  sanitizeDecimalInput(event.target.value),
                                                )
                                              }
                                              aria-invalid={isInvalid}
                                              placeholder="0.000"
                                              autoComplete="off"
                                            />
                                            {isInvalid ? (
                                              <FieldError errors={field.state.meta.errors} />
                                            ) : null}
                                          </Field>
                                        );
                                      }}
                                    </form.Field>
                                  </div>
                                </div>
                              ))}
                              {sizesFilled ? (
                                <p className="text-xs text-muted-foreground">
                                  Every tuber size is already on this strip.
                                </p>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-11"
                                  disabled={tuberSizesQuery.isPending || tuberSizes.length === 0}
                                  onClick={() => recordsField.pushValue(emptyTuberRecord())}
                                >
                                  <Plus />
                                  Add tuber record
                                </Button>
                              )}
                            </div>
                          );
                        }}
                      </form.Field>

                      <div className="border-t pt-4">
                        <StripPhotos
                          photos={photos}
                          error={photoErrors[strip.key] ?? null}
                          disabled={uploading || photos.length >= MAX_STRIP_PHOTOS}
                          onAddClick={() => {
                            photoTargetRef.current = strip.key;
                            fileInputRef.current?.click();
                          }}
                          onRemove={(photoId) => removePhoto(strip.key, photoId)}
                        />
                      </div>
                    </section>
                  );
                })}
                {stripsField.state.meta.errors.length > 0 && attempted ? (
                  <FieldError errors={stripsField.state.meta.errors} />
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => stripsField.pushValue(emptyStrip())}
                >
                  <Plus />
                  Add strip
                </Button>
              </div>
            )}
          </form.Field>
        </FieldGroup>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          const stripKey = photoTargetRef.current;
          if (stripKey) addPhotos(stripKey, event.target.files);
          event.target.value = '';
        }}
      />

      <div className="border-t px-6 py-4">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="h-11 w-full" disabled={isSubmitting || uploading}>
              {uploading
                ? 'Uploading photos…'
                : isSubmitting
                  ? 'Saving…'
                  : editing
                    ? 'Save changes'
                    : 'Add strip test'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

function StripPhotos({
  photos,
  error,
  disabled,
  onAddClick,
  onRemove,
}: {
  photos: StripPhoto[];
  error: string | null;
  disabled: boolean;
  onAddClick: () => void;
  onRemove: (photoId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>Photos</FieldLabel>
        <span className="text-sm text-muted-foreground">
          {photos.length}/{MAX_STRIP_PHOTOS}
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
                onClick={() => onRemove(photo.id)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        disabled={disabled}
        onClick={onAddClick}
      >
        <ImagePlus />
        Add photos
      </Button>
      <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP up to 8 MB each.</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
