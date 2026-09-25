'use client';

import { useForm } from '@tanstack/react-form';
import { useMemo } from 'react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpdateNamedMaster } from '@/features/master/api/use-update-named-master';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import type { NamedMaster } from '@/features/master/types';

export type EditNamedMasterFormValues = {
  name: string;
};

interface EditNamedMasterFormProps {
  resourceId: AddressMasterId;
  item: NamedMaster;
  onSuccess?: (values: EditNamedMasterFormValues) => void;
  onCancel?: () => void;
}

export function EditNamedMasterForm({
  resourceId,
  item,
  onSuccess,
  onCancel,
}: EditNamedMasterFormProps) {
  const resource = getAddressMaster(resourceId);
  const { mutateAsync: updateNamedMaster, isPending } = useUpdateNamedMaster(resourceId);
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
      name: item.name,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const submitted: EditNamedMasterFormValues = {
        name: value.name.trim(),
      };

      await updateNamedMaster({
        id: item.id,
        name: submitted.name,
      });
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id={`edit-named-master-${resourceId}`}
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
