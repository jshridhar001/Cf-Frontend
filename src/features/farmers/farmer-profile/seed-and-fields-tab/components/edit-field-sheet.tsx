import { useForm } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-field';
import { useUpdateField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-update-field';
import { FieldGeoInput } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/field-geo-input';
import { normalizeGeoLocationForStorage } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/normalize-geo-location';
import { parseGeoLocationInput } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/parse-geo-location';
import type { FarmerField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';
import { getApiErrorMessage } from '@/lib/api-client';

const positiveAcres = z
  .string()
  .trim()
  .min(1, 'Acres is required')
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value),
    'Enter a valid number with up to 2 decimal places',
  )
  .refine((value) => Number.parseFloat(value) > 0, 'Must be greater than 0');

const editFieldFormSchema = z.object({
  name: z.string().trim().min(1, 'Field name is required').max(120),
  acres: positiveAcres,
  geoLocation: z
    .string()
    .trim()
    .refine(
      (value) => !value || parseGeoLocationInput(value).success,
      'Upload a valid KML plot boundary.',
    ),
});

function acresInputValue(acres: string) {
  const value = Number.parseFloat(acres);
  if (!Number.isFinite(value) || value <= 0) return '';
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function EditFieldSheet({
  fieldId,
  open,
  onOpenChange,
}: {
  fieldId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fieldQuery = useField(open ? fieldId : null);
  const field = fieldQuery.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader className="pr-12">
          <SheetTitle>Edit field</SheetTitle>
          <SheetDescription>
            Update the name, acres, or plot boundary for this field.
          </SheetDescription>
        </SheetHeader>
        {open && fieldQuery.isPending ? (
          <div className="flex flex-col gap-3 px-6 pb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}
        {open && fieldQuery.isError ? (
          <p className="px-6 pb-6 text-sm text-destructive">
            {getApiErrorMessage(fieldQuery.error, 'Failed to load this field.')}
          </p>
        ) : null}
        {open && field ? (
          <EditFieldForm
            key={`${field.id}-${field.updatedAt}`}
            field={field}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function EditFieldForm({
  field,
  onOpenChange,
}: {
  field: FarmerField;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync: updateField } = useUpdateField();

  const form = useForm({
    defaultValues: {
      name: field.name,
      acres: acresInputValue(field.acres),
      geoLocation: field.geoLocation ?? '',
    },
    validators: { onSubmit: editFieldFormSchema },
    onSubmit: async ({ value }) => {
      const geoTrimmed = value.geoLocation.trim();
      try {
        await updateField({
          id: field.id,
          body: {
            name: value.name.trim(),
            acres: value.acres.trim(),
            geoLocation: geoTrimmed ? normalizeGeoLocationForStorage(geoTrimmed) : null,
          },
        });
        onOpenChange(false);
      } catch {
        // Error toast is handled by the mutation.
      }
    },
  });

  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="gap-6">
        <form.Field name="name">
          {(formField) => {
            const isInvalid = formField.state.meta.isTouched && !formField.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-field-name">Field name</FieldLabel>
                <Input
                  id="edit-field-name"
                  value={formField.state.value}
                  onBlur={formField.handleBlur}
                  onChange={(event) => formField.handleChange(event.target.value)}
                  placeholder="e.g. North plot"
                  autoComplete="off"
                  aria-invalid={isInvalid}
                />
                {isInvalid ? <FieldError errors={formField.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="acres">
          {(formField) => {
            const isInvalid = formField.state.meta.isTouched && !formField.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-field-acres">Acres</FieldLabel>
                <Input
                  id="edit-field-acres"
                  inputMode="decimal"
                  value={formField.state.value}
                  onBlur={formField.handleBlur}
                  onChange={(event) => formField.handleChange(event.target.value)}
                  placeholder="e.g. 2.5"
                  autoComplete="off"
                  aria-invalid={isInvalid}
                />
                {isInvalid ? <FieldError errors={formField.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="geoLocation">
          {(formField) => {
            const isInvalid = formField.state.meta.isTouched && !formField.state.meta.isValid;
            return (
              <FieldGeoInput
                id="edit-field-geo-location"
                value={formField.state.value}
                fieldName={form.state.values.name}
                onBlur={formField.handleBlur}
                onChange={formField.handleChange}
                isInvalid={isInvalid}
                errors={formField.state.meta.errors}
              />
            );
          }}
        </form.Field>
      </FieldGroup>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
