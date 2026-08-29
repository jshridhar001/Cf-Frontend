'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateGeneration } from '@/features/master/api/use-create-generation';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Generation name is required.')
    .max(128, 'Generation name must be at most 128 characters.'),
});

export type CreateGenerationFormValues = {
  name: string;
};

interface CreateGenerationFormProps {
  onSuccess?: (values: CreateGenerationFormValues) => void;
  onCancel?: () => void;
}

export function CreateGenerationForm({ onSuccess, onCancel }: CreateGenerationFormProps) {
  const { mutateAsync: createGeneration, isPending } = useCreateGeneration();

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const submitted: CreateGenerationFormValues = {
        name: value.name.trim(),
      };

      await createGeneration(submitted);
      form.reset();
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="create-generation-form"
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
              {isPending ? 'Creating…' : 'Create Generation'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
