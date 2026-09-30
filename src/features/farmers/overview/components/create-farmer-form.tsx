import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateFarmer } from '@/features/farmers/overview/api/use-create-farmer';
import { useFarmerAddressOptions } from '@/features/farmers/overview/api/use-farmer-address-options';
import type { FarmerAddressOption } from '@/features/farmers/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';

const requiredId = (label: string) => z.string().min(1, `${label} is required.`);

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(64),
  accountNumber: z.string().min(1, 'Account number is required.').max(32),
  mobileNumber: z.string().min(8, 'Enter a valid mobile number.').max(20),
  aadharNumber: z.string().refine((value) => !value || /^\d{12}$/.test(value), {
    message: 'Aadhaar must be 12 digits.',
  }),
  bankName: z.string().min(2, 'Bank name must be at least 2 characters.').max(64),
  bankAccountNumber: z
    .string()
    .regex(/^\d{8,18}$/, 'Enter a bank account number with 8 to 18 digits.'),
  ifscCode: z
    .string()
    .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Enter a valid 11-character IFSC code.'),
  stateId: requiredId('State'),
  districtId: requiredId('District'),
  stationId: requiredId('Station'),
  villageId: requiredId('Village'),
  postOfficeId: requiredId('Post office'),
  policeStationId: requiredId('Police station'),
  pincodeId: requiredId('Pincode'),
});

interface CreateFarmerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

function AddressSelect({
  name,
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
  name: string;
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  options: FarmerAddressOption[];
  invalid?: boolean;
  errors?: Array<{ message?: string } | undefined>;
  onBlur?: () => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <SearchableOptionCombobox
        id={name}
        name={name}
        value={value}
        onValueChange={onValueChange}
        onBlur={onBlur ?? (() => undefined)}
        isInvalid={Boolean(invalid)}
        placeholder={placeholder}
        emptyMessage={`No ${label.toLowerCase()} found`}
        options={options.map((option) => ({ id: option.id, label: option.name }))}
        disabled={disabled || options.length === 0}
      />
      {invalid ? <FieldError errors={errors} /> : null}
    </Field>
  );
}

export function CreateFarmerForm({ onSuccess, onCancel }: CreateFarmerFormProps) {
  const { mutateAsync: createFarmer, isPending } = useCreateFarmer();
  const {
    data: addressOptions,
    isPending: optionsPending,
    isError: optionsError,
    error: optionsErrorValue,
    refetch: refetchAddressOptions,
  } = useFarmerAddressOptions();

  const form = useForm({
    defaultValues: {
      name: '',
      accountNumber: '',
      mobileNumber: '',
      aadharNumber: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      stateId: '',
      districtId: '',
      stationId: '',
      villageId: '',
      postOfficeId: '',
      policeStationId: '',
      pincodeId: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await createFarmer({
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
        bankName: value.bankName.trim(),
        bankAccountNumber: value.bankAccountNumber.trim(),
        ifscCode: value.ifscCode.trim().toUpperCase(),
        ...(value.aadharNumber.trim() ? { aadharNumber: value.aadharNumber.trim() } : {}),
      });
      form.reset();
      onSuccess?.();
    },
  });

  return (
    <form
      id="create-farmer-form"
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
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Gurpreet Kaur"
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
                <FieldLabel htmlFor={field.name}>Account number</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="CF-FARMER-006"
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
                <FieldLabel htmlFor={field.name}>Mobile</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="9000000006"
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
                <FieldLabel htmlFor={field.name}>Aadhaar (optional)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 12))
                  }
                  aria-invalid={isInvalid}
                  placeholder="100000000006"
                  inputMode="numeric"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="bankName">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Bank name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="State Bank of India"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="bankAccountNumber">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Bank account number</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 18))
                  }
                  aria-invalid={isInvalid}
                  placeholder="12345678901"
                  inputMode="numeric"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="ifscCode">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>IFSC code</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value.toUpperCase().slice(0, 11))}
                  aria-invalid={isInvalid}
                  placeholder="SBIN0001234"
                  maxLength={11}
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
                    name={field.name}
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
                    name={field.name}
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
                    name={field.name}
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
                    name={field.name}
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
                    name={field.name}
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
                    name={field.name}
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
                    name={field.name}
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
            <Button type="submit" disabled={!canSubmit || isPending || optionsPending}>
              {isPending ? 'Creating…' : 'Add farmer'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
