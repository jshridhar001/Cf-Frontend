'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpdateFacilityStock } from '@/features/master/api/use-update-facility-stock';
import type { FacilityStockTableRow } from './facility-stock-table-column';

const quantitySchema = z
  .string()
  .trim()
  .refine((value) => /^\d+$/.test(value) && Number(value) >= 0, {
    message: 'Quantity must be a whole number of 0 or more.',
  });

const formSchema = z.object({
  initialQuantity: quantitySchema,
  currentQuantity: quantitySchema,
});

interface EditFacilityStockFormProps {
  stock: FacilityStockTableRow;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditFacilityStockForm({ stock, onSuccess, onCancel }: EditFacilityStockFormProps) {
  const { mutateAsync: updateFacilityStock, isPending } = useUpdateFacilityStock();

  const form = useForm({
    defaultValues: {
      initialQuantity: String(stock.initialQuantity),
      currentQuantity: String(stock.currentQuantity),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await updateFacilityStock({
        stockId: stock.id,
        initialQuantity: Number(value.initialQuantity),
        currentQuantity: Number(value.currentQuantity),
      });
      onSuccess?.();
    },
  });

  return (
    <form
      id="edit-facility-stock-form"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="initialQuantity">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Initial quantity</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
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

        <form.Field name="currentQuantity">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Current quantity</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
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
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
