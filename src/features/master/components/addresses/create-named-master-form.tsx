'use client';

import { useForm } from '@tanstack/react-form';
import { useMemo } from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateNamedMaster } from '@/features/master/api/use-create-named-master';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';

export type CreateNamedMasterFormValues = {
  name: string;
};

interface CreateNamedMasterFormProps {
  resourceId: AddressMasterId;
  onSuccess?: (values: CreateNamedMasterFormValues) => void;
  onCancel?: () => void;
}

export function CreateNamedMasterForm({
  resourceId,
  onSuccess,
  onCancel,
}: CreateNamedMasterFormProps) {
  const resource = getAddressMaster(resourceId);
  const { mutateAsync: createNamedMaster, isPending } = useCreateNamedMaster(resourceId);
  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, `${resource.singularTitle} name is required.`)
          .max(128, `${resource.singularTitle} name must be at most 128 characters.`),
      }),
    [resource.singularTitle],
  );

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const submitted: CreateNamedMasterFormValues = {
        name: value.name.trim(),
      };

      await createNamedMaster(submitted);
      form.reset();
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id={`create-named-master-${resourceId}`}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{resource.singularTitle} Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder={resource.singularTitle}
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
              {isPending ? 'Creating…' : `Create ${resource.singularTitle}`}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
