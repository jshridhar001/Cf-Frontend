'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateFacilityStock } from '@/features/master/api/use-create-facility-stock';
import { useGenerations } from '@/features/master/api/use-generations';
import { useSeedSizes } from '@/features/master/api/use-seed-sizes';
import { useVarieties } from '@/features/master/api/use-varieties';

const quantitySchema = z
  .string()
  .trim()
  .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
    message: 'Quantity must be a whole number of at least 1.',
  });

const formSchema = z.object({
  varietyId: z.string().min(1, 'Variety is required.'),
  sizeId: z.string().min(1, 'Seed size is required.'),
  generationId: z.string().min(1, 'Generation is required.'),
  quantity: quantitySchema,
});

interface CreateFacilityStockFormProps {
  facilityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateFacilityStockForm({
  facilityId,
  onSuccess,
  onCancel,
}: CreateFacilityStockFormProps) {
  const { mutateAsync: createFacilityStock, isPending } = useCreateFacilityStock();
  const { data: varieties = [] } = useVarieties();
  const { data: seedSizes = [] } = useSeedSizes();
  const { data: generations = [] } = useGenerations();

  const form = useForm({
    defaultValues: {
      varietyId: '',
      sizeId: '',
      generationId: '',
      quantity: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await createFacilityStock({
        facilityId,
        varietyId: value.varietyId,
        sizeId: value.sizeId,
        generationId: value.generationId,
        quantity: Number(value.quantity),
      });
      form.reset();
      onSuccess?.();
    },
  });

  return (
    <form
      id="create-facility-stock-form"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
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
                  onValueChange={field.handleChange}
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
                  placeholder="Select a seed size"
                  emptyMessage="No seed sizes found"
                  disabled={isPending}
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
              {isPending ? 'Adding…' : 'Add Stock'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
