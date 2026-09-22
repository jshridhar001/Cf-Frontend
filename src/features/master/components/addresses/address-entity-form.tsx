'use client';

import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  resolveAddressCascade,
  useCreateAddress,
  useUpdateAddress,
} from '@/features/master/api/use-addresses';
import { AddressParentCascade } from '@/features/master/components/addresses/address-parent-cascade';
import {
  ADDRESS_LEVEL_CONFIG,
  type AddressFormValues,
  type AddressLevel,
  type CascadeValues,
  getAddressPincode,
} from '@/features/master/lib/address-levels';
import type { AddressEntity } from '@/features/master/types/addresses';

function getFormSchema(level: AddressLevel) {
  const config = ADDRESS_LEVEL_CONFIG[level];
  const parentMessage = config.parentLabel
    ? `${config.parentLabel} is required.`
    : 'Parent is required.';

  return z.object({
    name: z.string().min(1, 'Name is required.').max(128, 'Name must be at most 128 characters.'),
    pincode: config.hasPincode
      ? z.string().regex(/^[0-9]{6}$/, 'Must be a 6-digit pincode.')
      : z.string(),
    stateId: config.parentFk === 'stateId' ? z.string().min(1, parentMessage) : z.string(),
    districtId: config.parentFk === 'districtId' ? z.string().min(1, parentMessage) : z.string(),
    postOfficeId:
      config.parentFk === 'postOfficeId' ? z.string().min(1, parentMessage) : z.string(),
    policeStationId:
      config.parentFk === 'policeStationId' ? z.string().min(1, parentMessage) : z.string(),
    villageId: config.parentFk === 'villageId' ? z.string().min(1, parentMessage) : z.string(),
  });
}

interface AddressEntityFormProps {
  level: AddressLevel;
  entity?: AddressEntity | null;
  initialParentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddressEntityForm({
  level,
  entity,
  initialParentId,
  onSuccess,
  onCancel,
}: AddressEntityFormProps) {
  const [defaults, setDefaults] = useState<AddressFormValues | null>(null);

  useEffect(() => {
    let cancelled = false;

    void resolveAddressCascade({ level, entity, parentId: initialParentId }).then((cascade) => {
      if (cancelled) return;
      setDefaults({
        name: entity?.name ?? '',
        pincode: entity ? (getAddressPincode(entity) ?? '') : '',
        ...cascade,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [level, entity, initialParentId]);

  if (!defaults) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <AddressEntityFormFields
      key={`${level}-${entity?.id ?? 'new'}-${initialParentId ?? ''}-${defaults.stateId}-${defaults.villageId}`}
      level={level}
      entity={entity}
      defaultValues={defaults}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

interface AddressEntityFormFieldsProps {
  level: AddressLevel;
  entity?: AddressEntity | null;
  defaultValues: AddressFormValues;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function AddressEntityFormFields({
  level,
  entity,
  defaultValues,
  onSuccess,
  onCancel,
}: AddressEntityFormFieldsProps) {
  const config = ADDRESS_LEVEL_CONFIG[level];
  const isEdit = Boolean(entity);
  const { mutateAsync: createAddress, isPending: isCreating } = useCreateAddress(level);
  const { mutateAsync: updateAddress, isPending: isUpdating } = useUpdateAddress(level);
  const isPending = isCreating || isUpdating;

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: getFormSchema(level),
    },
    onSubmit: async ({ value }) => {
      const submitted: AddressFormValues = {
        ...value,
        name: value.name.trim(),
        pincode: value.pincode.trim(),
      };

      if (entity) {
        await updateAddress({ id: entity.id, values: submitted });
      } else {
        await createAddress(submitted);
        form.reset();
      }
      onSuccess?.();
    },
  });

  return (
    <form
      id={isEdit ? `edit-address-${level}-form` : `create-address-${level}-form`}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Subscribe selector={(state) => state.values}>
          {(values) => (
            <AddressParentCascade
              level={level}
              values={values}
              disabled={isPending}
              onChange={(next: CascadeValues) => {
                form.setFieldValue('stateId', next.stateId);
                form.setFieldValue('districtId', next.districtId);
                form.setFieldValue('postOfficeId', next.postOfficeId);
                form.setFieldValue('policeStationId', next.policeStationId);
                form.setFieldValue('villageId', next.villageId);
              }}
            />
          )}
        </form.Subscribe>

        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder={config.singular}
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        {config.hasPincode ? (
          <form.Field name="pincode">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Pincode</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="263001"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>
        ) : null}
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
              {isPending
                ? isEdit
                  ? 'Saving…'
                  : 'Creating…'
                : isEdit
                  ? 'Save Changes'
                  : `Create ${config.singular}`}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
