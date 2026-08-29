'use client';

import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateFacility } from '@/features/master/api/use-update-facility';
import { FACILITY_USED_IN_OPTIONS, isFacilityUsedIn } from '@/features/master/lib/facility-used-in';
import type { Facility, FacilityUsedIn } from '@/features/master/types';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Facility name is required.')
    .max(128, 'Facility name must be at most 128 characters.'),
  usedIn: z
    .string()
    .refine(isFacilityUsedIn, { message: 'Please select where this facility is used.' }),
});

export type EditFacilityFormValues = {
  name: string;
  usedIn: FacilityUsedIn;
};

interface EditFacilityFormProps {
  facility: Facility;
  onSuccess?: (values: EditFacilityFormValues) => void;
  onCancel?: () => void;
}

export function EditFacilityForm({ facility, onSuccess, onCancel }: EditFacilityFormProps) {
  const { mutateAsync: updateFacility, isPending } = useUpdateFacility();

  const form = useForm({
    defaultValues: {
      name: facility.name,
      usedIn: facility.usedIn as string,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isFacilityUsedIn(value.usedIn)) return;

      const submitted: EditFacilityFormValues = {
        name: value.name.trim(),
        usedIn: value.usedIn,
      };

      await updateFacility({
        facilityId: facility.id,
        name: submitted.name,
        usedIn: submitted.usedIn,
      });
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="edit-facility-form"
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
                <FieldLabel htmlFor={field.name}>Facility Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Cold Store A"
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="usedIn">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Used In</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value ?? '')}
                  disabled={isPending}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid} className="w-full">
                    <SelectValue placeholder="Select where this facility is used" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITY_USED_IN_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
