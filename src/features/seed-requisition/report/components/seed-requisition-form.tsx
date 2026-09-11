import { useForm } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type {
  SeedRequisitionFormOption,
  SeedRequisitionFormOptions,
} from '@/features/seed-requisition/report/lib/form-options';
import {
  type CreateSeedRequisitionFormValues,
  createSeedRequisitionFormSchema,
  emptyCreateSeedRequisitionFormValues,
} from '@/features/seed-requisition/report/schemas/seed-requisition.schema';

function OptionCombobox({
  id,
  value,
  options,
  placeholder,
  emptyMessage,
  isInvalid,
  disabled = false,
  onValueChange,
  onBlur,
}: {
  id: string;
  value: string;
  options: SeedRequisitionFormOption[];
  placeholder: string;
  emptyMessage: string;
  isInvalid: boolean;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  onBlur: () => void;
}) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(option) => onValueChange(option?.value ?? '')}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-invalid={isInvalid}
        disabled={disabled}
        onBlur={onBlur}
        className="w-full min-w-0"
      />
      <ComboboxContent className="min-w-(--anchor-width)">
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export type SeedRequisitionFormProps = {
  options: SeedRequisitionFormOptions;
  defaultValues?: CreateSeedRequisitionFormValues;
  isEdit?: boolean;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: CreateSeedRequisitionFormValues) => Promise<void>;
  onCancel: () => void;
};

export function SeedRequisitionForm({
  options,
  defaultValues = emptyCreateSeedRequisitionFormValues,
  isEdit = false,
  submitLabel,
  pendingLabel,
  onSubmit,
  onCancel,
}: SeedRequisitionFormProps) {
  const form = useForm({
    defaultValues,
    validators: {
      onChange: createSeedRequisitionFormSchema,
    },
    onSubmit: async ({ value }) => {
      const values = value as CreateSeedRequisitionFormValues;
      try {
        await onSubmit(values);
      } catch {
        // Error toast is handled by the mutation.
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FieldGroup>
        <form.Field name="farmerId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="sr-form-farmer">Farmer</FieldLabel>
                <OptionCombobox
                  id="sr-form-farmer"
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  disabled={isEdit}
                  placeholder="Select farmer"
                  emptyMessage="No farmers found."
                  options={options.farmers}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="varietyId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="sr-form-variety">Variety</FieldLabel>
                <OptionCombobox
                  id="sr-form-variety"
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  disabled={isEdit}
                  placeholder="Select variety"
                  emptyMessage="No varieties found."
                  options={options.varieties}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <div className="space-y-3">
          <form.Field name="quantityMode">
            {(field) => (
              <Field>
                <FieldLabel>Quantity</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={field.state.value === 'acres' ? 'default' : 'outline'}
                    onClick={() => {
                      field.handleChange('acres');
                      form.setFieldValue('seedBags', 0);
                    }}
                  >
                    Acres
                  </Button>
                  <Button
                    type="button"
                    variant={field.state.value === 'bags' ? 'default' : 'outline'}
                    onClick={() => {
                      field.handleChange('bags');
                      form.setFieldValue('acres', 0);
                    }}
                  >
                    Seed bags
                  </Button>
                </div>
              </Field>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.quantityMode}>
            {(quantityMode) =>
              quantityMode === 'acres' ? (
                <form.Field name="acres">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="sr-form-acres">Acres</FieldLabel>
                        <Input
                          id="sr-form-acres"
                          type="number"
                          step="0.01"
                          min="0"
                          name={field.name}
                          value={field.state.value || ''}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(Number(event.target.value) || 0)}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>
              ) : (
                <form.Field name="seedBags">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="sr-form-seed-bags">Seed bags</FieldLabel>
                        <Input
                          id="sr-form-seed-bags"
                          type="number"
                          step="1"
                          min="0"
                          name={field.name}
                          value={field.state.value || ''}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(Number(event.target.value) || 0)}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>
              )
            }
          </form.Subscribe>
        </div>

        <form.Field name="requisitionDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="sr-form-requisition-date">Requisition date</FieldLabel>
                <Input
                  id="sr-form-requisition-date"
                  type="date"
                  name={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isEdit}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="requestedDeliveryDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="sr-form-requested-delivery">Requested delivery</FieldLabel>
                <Input
                  id="sr-form-requested-delivery"
                  type="date"
                  name={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="remarks">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="sr-form-remarks">Remarks (optional)</FieldLabel>
                <Input
                  id="sr-form-remarks"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Optional notes"
                  aria-invalid={isInvalid}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {pendingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
