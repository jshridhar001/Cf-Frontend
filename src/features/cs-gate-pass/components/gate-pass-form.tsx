'use client';

import { useForm } from '@tanstack/react-form';
import type { ReactNode } from 'react';
import * as z from 'zod';

import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import {
  DatePickerInput,
  formatDateOnlyString,
  parseDateOnlyString,
} from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useFacilities } from '@/features/master/api/use-facilities';
import { useGenerations } from '@/features/master/api/use-generations';
import { useSeedSizes } from '@/features/master/api/use-seed-sizes';
import { useVarieties } from '@/features/master/api/use-varieties';
import type { SeedSize } from '@/features/master/types';

const formSchema = z.object({
  facilityId: z.string().min(1, 'Cold storage is required.'),
  gatePassDate: z.string().min(1, 'Date is required.'),
  varietyId: z.string().min(1, 'Variety is required.'),
  generationId: z.string().min(1, 'Generation is required.'),
  sizeId: z.string().min(1, 'Seed size is required.'),
  quantity: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
      message: 'Quantity must be a whole number of at least 1.',
    }),
});

export type GatePassFormValues = z.infer<typeof formSchema>;

interface GatePassFormProps {
  formId: string;
  defaultValues: GatePassFormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (value: GatePassFormValues) => Promise<void>;
  onCancel?: () => void;
}

function VarietySeedSizes({
  varietyId,
  children,
}: {
  varietyId: string;
  children: (seedSizes: SeedSize[]) => ReactNode;
}) {
  const { data: seedSizes = [] } = useSeedSizes(varietyId, {
    enabled: varietyId.length > 0,
  });

  return children(varietyId ? seedSizes : []);
}

export function GatePassForm({
  formId,
  defaultValues,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
  onCancel,
}: GatePassFormProps) {
  const { data: facilities = [] } = useFacilities();
  const { data: varieties = [] } = useVarieties();
  const { data: generations = [] } = useGenerations();

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="facilityId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Cold storage</FieldLabel>
                <SearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select a cold storage"
                  emptyMessage="No facilities found"
                  disabled={isPending}
                  options={facilities.map((facility) => ({
                    id: facility.id,
                    label: facility.name,
                  }))}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="gatePassDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <DatePickerInput
                  id={field.name}
                  label="Date"
                  placeholder="Select date"
                  value={field.state.value ? parseDateOnlyString(field.state.value) : undefined}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  onChange={(date) => {
                    field.handleChange(date ? formatDateOnlyString(date) : '');
                  }}
                  onBlur={field.handleBlur}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="varietyId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Variety</FieldLabel>
                <SearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    form.setFieldValue('sizeId', '');
                  }}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select a variety"
                  emptyMessage="No varieties found"
                  disabled={isPending}
                  options={varieties.map((variety) => ({
                    id: variety.id,
                    label: variety.name,
                  }))}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="generationId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Generation</FieldLabel>
                <SearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select a generation"
                  emptyMessage="No generations found"
                  disabled={isPending}
                  options={generations.map((generation) => ({
                    id: generation.id,
                    label: generation.name,
                  }))}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.varietyId}>
          {(varietyId) => (
            <VarietySeedSizes varietyId={varietyId}>
              {(seedSizes) => (
                <form.Field name="sizeId">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Seed size</FieldLabel>
                        <SearchableOptionCombobox
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder={varietyId ? 'Select a seed size' : 'Select a variety first'}
                          emptyMessage="No seed sizes found"
                          disabled={isPending || !varietyId}
                          options={seedSizes.map((size) => ({
                            id: size.id,
                            label: size.name,
                          }))}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              )}
            </VarietySeedSizes>
          )}
        </form.Subscribe>

        <form.Field name="quantity">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={1}
                  step={1}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="100"
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
              {isPending ? pendingLabel : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
