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
import { useMe } from '@/features/auth/api/use-me';
import { useCreateField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-create-field';
import { FieldGeoInput } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/field-geo-input';
import { getFieldSurveyFromInput } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/field-survey';
import { acresFromSquareMeters } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/geo-metrics';
import { normalizeGeoLocationForStorage } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/normalize-geo-location';

const createFieldFormSchema = z.object({
  name: z.string().trim().min(1, 'Field name is required').max(120),
  geoLocation: z
    .string()
    .trim()
    .min(1, 'Upload a KML file so acres can be calculated.')
    .refine((value) => {
      const survey = getFieldSurveyFromInput(value);
      return survey !== null && survey.areaSquareMeters > 0;
    }, 'Upload a KML plot boundary so acres can be calculated.'),
});

export function AddFieldSheet({
  farmerId,
  open,
  onOpenChange,
}: {
  farmerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: me, isPending } = useMe();
  const currentUserId = me?.user.id ?? '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader className="pr-12">
          <SheetTitle>Add field</SheetTitle>
          <SheetDescription>
            Register a land plot for this farmer. You can record farming activities on the field
            detail screen.
          </SheetDescription>
        </SheetHeader>
        {open && currentUserId ? (
          <AddFieldForm
            farmerId={farmerId}
            currentUserId={currentUserId}
            onOpenChange={onOpenChange}
          />
        ) : (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            {isPending ? 'Loading your account…' : 'You must be signed in to add a field.'}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function AddFieldForm({
  farmerId,
  currentUserId,
  onOpenChange,
}: {
  farmerId: string;
  currentUserId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync: createField } = useCreateField();

  const form = useForm({
    defaultValues: {
      name: '',
      geoLocation: '',
    },
    validators: { onSubmit: createFieldFormSchema },
    onSubmit: async ({ value }) => {
      const geoTrimmed = value.geoLocation.trim();
      const survey = getFieldSurveyFromInput(geoTrimmed);
      if (!survey || survey.areaSquareMeters <= 0) return;
      try {
        await createField({
          farmerId,
          name: value.name.trim(),
          acres: acresFromSquareMeters(survey.areaSquareMeters),
          assignedOfficerId: currentUserId,
          geoLocation: normalizeGeoLocationForStorage(geoTrimmed),
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
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="field-name">Field name</FieldLabel>
                <Input
                  id="field-name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="e.g. North plot"
                  autoComplete="off"
                  aria-invalid={isInvalid}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="geoLocation">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <FieldGeoInput
                id="field-geo-location"
                value={field.state.value}
                fieldName={form.state.values.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                isInvalid={isInvalid}
                errors={field.state.meta.errors}
                optional={false}
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
                Creating…
              </>
            ) : (
              'Create field'
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
