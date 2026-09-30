import { useForm } from '@tanstack/react-form';
import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmerAddressOptions } from '@/features/farmers/overview/api/use-farmer-address-options';
import { useUpdateFarmer } from '@/features/farmers/overview/api/use-update-farmer';
import { FarmerTypeFields } from '@/features/farmers/overview/components/farmer-type-fields';
import {
  editFarmerFormDefaults,
  farmerFormSchema,
  toFarmerApiPayload,
} from '@/features/farmers/overview/lib/farmer-form-schema';
import {
  type Farmer,
  type FarmerAddressOption,
  familyFromApi,
} from '@/features/farmers/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';

interface EditFarmerFormProps {
  farmer: Farmer;
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
    defaultValues: editFarmerFormDefaults(farmer),
    validators: {
      onSubmit: farmerFormSchema,
    },
    onSubmit: async ({ value }) => {
      await updateFarmer({
        id: farmer.id,
        body: toFarmerApiPayload(value),
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
        <FarmerTypeFields
          form={form}
          idPrefix="edit-"
          disabled={isPending}
          savedFamily={familyFromApi(farmer)}
        />
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

        <form.Field name="panNumber">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`edit-${field.name}`}>PAN (optional)</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 10),
                    )
                  }
                  aria-invalid={isInvalid}
                  maxLength={10}
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
                <FieldLabel htmlFor={`edit-${field.name}`}>Bank name</FieldLabel>
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

        <form.Field name="bankAccountNumber">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`edit-${field.name}`}>Bank account number</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 18))
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

        <form.Field name="ifscCode">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`edit-${field.name}`}>IFSC code</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value.toUpperCase().slice(0, 11))}
                  aria-invalid={isInvalid}
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
                    onValueChange={(stationId) => {
                      field.handleChange(stationId);
                      form.setFieldValue('familyId', '');
                    }}
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
