'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpdateSeedSize } from '@/features/master/api/use-update-seed-size';
import type { SeedSize } from '@/features/master/types';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Seed size name is required.')
    .max(128, 'Seed size name must be at most 128 characters.'),
  seedBagsPerAcre: z
    .string()
    .refine(
      (value) => value.trim() === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      'Seed bags per acre must be a non-negative number.',
    ),
});

export type EditSeedSizeFormValues = {
  name: string;
  seedBagsPerAcre: number | null;
};

interface EditSeedSizeFormProps {
  seedSize: SeedSize;
  onSuccess?: (values: EditSeedSizeFormValues) => void;
  onCancel?: () => void;
}

export function EditSeedSizeForm({ seedSize, onSuccess, onCancel }: EditSeedSizeFormProps) {
  const { mutateAsync: updateSeedSize, isPending } = useUpdateSeedSize();

  const form = useForm({
    defaultValues: {
      name: seedSize.name,
      seedBagsPerAcre: seedSize.seedBagsPerAcre == null ? '' : String(seedSize.seedBagsPerAcre),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const trimmedBags = value.seedBagsPerAcre.trim();
      const submitted: EditSeedSizeFormValues = {
        name: value.name.trim(),
        seedBagsPerAcre: trimmedBags === '' ? null : Number(trimmedBags),
      };

      await updateSeedSize({
        seedSizeId: seedSize.id,
        name: submitted.name,
        seedBagsPerAcre: submitted.seedBagsPerAcre,
      });
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="edit-seed-size-form"
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
                <FieldLabel htmlFor={field.name}>Seed Size</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="45-50"
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="seedBagsPerAcre">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Seed Bags per Acre (optional)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  step={1}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="12"
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
        <Button type="button" variant="outline" disabled={isPending} onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
