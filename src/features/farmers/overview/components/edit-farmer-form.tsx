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
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmerAddressOptions } from '@/features/farmers/overview/api/use-farmer-address-options';
import { useUpdateFarmer } from '@/features/farmers/overview/api/use-update-farmer';
import type { Farmer, FarmerAddressOption } from '@/features/farmers/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';

const requiredId = (label: string) => z.string().min(1, `${label} is required.`);

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(64),
  accountNumber: z.string().min(1, 'Account number is required.').max(32),
  mobileNumber: z.string().min(8, 'Enter a valid mobile number.').max(20),
  aadharNumber: z.string().refine((value) => !value || /^\d{12}$/.test(value), {
    message: 'Aadhaar must be 12 digits.',
  }),
  stateId: requiredId('State'),
  districtId: requiredId('District'),
  stationId: requiredId('Station'),
  villageId: requiredId('Village'),
  postOfficeId: requiredId('Post office'),
  policeStationId: requiredId('Police station'),
  pincodeId: requiredId('Pincode'),
});

interface EditFarmerFormProps {
  farmer: Farmer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function idOrEmpty(value?: string | null) {
  return value ?? '';
}

function AddressSelect({
  label,
  value,
  placeholder,
  disabled,
  options,
  invalid,
  errors,
  onBlur,
  onValueChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  options: FarmerAddressOption[];
  invalid?: boolean;
  errors?: unknown[];
  onBlur?: () => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Select
        value={value || undefined}
        disabled={disabled || options.length === 0}
        onValueChange={(next) => {
          if (next) onValueChange(next);
        }}
      >
        <SelectTrigger aria-invalid={invalid} className="w-full" onBlur={onBlur}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {invalid ? <FieldError errors={errors} /> : null}
    </Field>
  );
}

export function EditFarmerForm({ farmer, onSuccess, onCancel }: EditFarmerFormProps) {
  const { mutateAsync: updateFarmer, isPending } = useUpdateFarmer();
  const {
    data: addressOptions,
    isPending: optionsPending,
    isError: optionsError,
    error: optionsErrorValue,
    refetch: refetchAddressOptions,
  } = useFarmerAddressOptions();

  const form = useForm({
    defaultValues: {
      name: farmer.name,
      accountNumber: farmer.accountNumber,
      mobileNumber: farmer.mobileNumber,
      aadharNumber: farmer.aadharNumber ?? '',
      stateId: idOrEmpty(farmer.stateId),
      districtId: idOrEmpty(farmer.districtId),
      stationId: idOrEmpty(farmer.stationId),
      villageId: idOrEmpty(farmer.villageId),
      postOfficeId: idOrEmpty(farmer.postOfficeId),
      policeStationId: idOrEmpty(farmer.policeStationId),
      pincodeId: idOrEmpty(farmer.pincodeId),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await updateFarmer({
        id: farmer.id,
        body: {
          name: value.name.trim(),
          accountNumber: value.accountNumber.trim(),
          mobileNumber: value.mobileNumber.trim(),
          stationId: value.stationId,
          villageId: value.villageId,
          postOfficeId: value.postOfficeId,
          policeStationId: value.policeStationId,
          districtId: value.districtId,
          stateId: value.stateId,
          pincodeId: value.pincodeId,
          ...(value.aadharNumber.trim() ? { aadharNumber: value.aadharNumber.trim() } : {}),
        },
      });
      onSuccess?.();
    },
  });

  return (
    <form
      id="edit-farmer-form"
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
                <FieldLabel htmlFor={`edit-${field.name}`}>Name</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="name"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="accountNumber">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`edit-${field.name}`}>Account number</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="mobileNumber">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`edit-${field.name}`}>Mobile</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="tel"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="aadharNumber">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`edit-${field.name}`}>Aadhaar (optional)</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 12))
                  }
                  aria-invalid={isInvalid}
                  inputMode="numeric"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        {optionsPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : optionsError ? (
          <Field>
            <FieldLabel>Address</FieldLabel>
            <p className="text-sm text-destructive">
              {getApiErrorMessage(optionsErrorValue, 'Could not load address options.')}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-fit"
              onClick={() => void refetchAddressOptions()}
            >
              Try again
            </Button>
          </Field>
        ) : (
          <>
            <form.Field name="stateId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <AddressSelect
                    label="State"
                    value={field.state.value}
                    placeholder="Select a state"
                    disabled={isPending}
                    options={addressOptions?.states ?? []}
                    invalid={isInvalid}
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={field.handleChange}
                  />
                );
              }}
            </form.Field>
            <form.Field name="districtId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <AddressSelect
                    label="District"
                    value={field.state.value}
                    placeholder="Select a district"
                    disabled={isPending}
                    options={addressOptions?.districts ?? []}
                    invalid={isInvalid}
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={field.handleChange}
                  />
                );
              }}
            </form.Field>
            <form.Field name="stationId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <AddressSelect
                    label="Station"
                    value={field.state.value}
                    placeholder="Select a station"
                    disabled={isPending}
                    options={addressOptions?.stations ?? []}
                    invalid={isInvalid}
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={field.handleChange}
                  />
                );
              }}
            </form.Field>
            <form.Field name="villageId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <AddressSelect
                    label="Village"
                    value={field.state.value}
                    placeholder="Select a village"
                    disabled={isPending}
                    options={addressOptions?.villages ?? []}
                    invalid={isInvalid}
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={field.handleChange}
                  />
                );
              }}
            </form.Field>
            <form.Field name="postOfficeId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <AddressSelect
                    label="Post office"
                    value={field.state.value}
                    placeholder="Select a post office"
                    disabled={isPending}
                    options={addressOptions?.postOffices ?? []}
                    invalid={isInvalid}
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={field.handleChange}
                  />
                );
              }}
            </form.Field>
            <form.Field name="policeStationId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <AddressSelect
                    label="Police station"
                    value={field.state.value}
                    placeholder="Select a police station"
                    disabled={isPending}
                    options={addressOptions?.policeStations ?? []}
                    invalid={isInvalid}
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={field.handleChange}
                  />
                );
              }}
            </form.Field>
            <form.Field name="pincodeId">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <AddressSelect
                    label="Pincode"
                    value={field.state.value}
                    placeholder="Select a pincode"
                    disabled={isPending}
                    options={addressOptions?.pincodes ?? []}
                    invalid={isInvalid}
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={field.handleChange}
                  />
                );
              }}
            </form.Field>
          </>
        )}
      </FieldGroup>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={isPending} onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending || optionsPending}>
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
