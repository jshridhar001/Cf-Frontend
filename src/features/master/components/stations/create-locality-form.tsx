'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateLocality } from '@/features/master/api/use-create-locality';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Locality name is required.')
    .max(128, 'Locality name must be at most 128 characters.'),
});

export type CreateLocalityFormValues = {
  name: string;
};

interface CreateLocalityFormProps {
  stationId: string;
  onSuccess?: (values: CreateLocalityFormValues) => void;
  onCancel?: () => void;
}

export function CreateLocalityForm({ stationId, onSuccess, onCancel }: CreateLocalityFormProps) {
  const { mutateAsync: createLocality, isPending } = useCreateLocality();

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const submitted: CreateLocalityFormValues = {
        name: value.name.trim(),
      };

      await createLocality({
        name: submitted.name,
        stationId,
      });
      form.reset();
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="create-locality-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Locality Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Mashobra"
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            form.reset();
            onCancel?.();
          }}
        >
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? 'Creating…' : 'Create Locality'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
