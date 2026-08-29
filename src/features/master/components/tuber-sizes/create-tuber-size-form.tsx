'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateTuberSize } from '@/features/master/api/use-create-tuber-size';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Tuber size name is required.')
    .max(128, 'Tuber size name must be at most 128 characters.'),
});

export type CreateTuberSizeFormValues = {
  name: string;
};

interface CreateTuberSizeFormProps {
  onSuccess?: (values: CreateTuberSizeFormValues) => void;
  onCancel?: () => void;
}

export function CreateTuberSizeForm({ onSuccess, onCancel }: CreateTuberSizeFormProps) {
  const { mutateAsync: createTuberSize, isPending } = useCreateTuberSize();

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const submitted: CreateTuberSizeFormValues = {
        name: value.name.trim(),
      };

      await createTuberSize(submitted);
      form.reset();
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="create-tuber-size-form"
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
                <FieldLabel htmlFor={field.name}>Tuber Size Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Small"
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
              {isPending ? 'Creating…' : 'Create Tuber Size'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
