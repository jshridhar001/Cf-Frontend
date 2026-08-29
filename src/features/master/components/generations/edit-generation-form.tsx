'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpdateGeneration } from '@/features/master/api/use-update-generation';
import type { Generation } from '@/features/master/types';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Generation name is required.')
    .max(128, 'Generation name must be at most 128 characters.'),
});

export type EditGenerationFormValues = {
  name: string;
};

interface EditGenerationFormProps {
  generation: Generation;
  onSuccess?: (values: EditGenerationFormValues) => void;
  onCancel?: () => void;
}

export function EditGenerationForm({ generation, onSuccess, onCancel }: EditGenerationFormProps) {
  const { mutateAsync: updateGeneration, isPending } = useUpdateGeneration();

  const form = useForm({
    defaultValues: {
      name: generation.name,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const submitted: EditGenerationFormValues = {
        name: value.name.trim(),
      };

      await updateGeneration({
        generationId: generation.id,
        name: submitted.name,
      });
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="edit-generation-form"
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
                <FieldLabel htmlFor={field.name}>Generation Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="G1"
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
