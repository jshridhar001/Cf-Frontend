'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpdateVariety } from '@/features/master/api/use-update-variety';
import type { Variety } from '@/features/master/types';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Variety name is required.')
    .max(128, 'Variety name must be at most 128 characters.'),
});

export type EditVarietyFormValues = {
  name: string;
};

interface EditVarietyFormProps {
  variety: Variety;
  onSuccess?: (values: EditVarietyFormValues) => void;
  onCancel?: () => void;
}

export function EditVarietyForm({ variety, onSuccess, onCancel }: EditVarietyFormProps) {
  const { mutateAsync: updateVariety, isPending } = useUpdateVariety();

  const form = useForm({
    defaultValues: {
      name: variety.name,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const submitted: EditVarietyFormValues = {
        name: value.name.trim(),
      };

      await updateVariety({
        varietyId: variety.id,
        name: submitted.name,
      });
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="edit-variety-form"
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
                <FieldLabel htmlFor={field.name}>Variety Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Kufri Jyoti"
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
