import type { ReactNode } from 'react';
import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFarmerFamilies } from '@/features/farmers/overview/api/use-farmer-families';
import {
  FARMER_TYPE_OPTIONS,
  type FarmerFormValues,
  familiesForStation,
  fieldsClearedByAccountType,
} from '@/features/farmers/overview/lib/farmer-form-schema';
import {
  type FarmerAccountType,
  type FarmerFamily,
  isFarmerAccountType,
} from '@/features/farmers/overview/types';
import { getApiErrorMessage } from '@/lib/api-client';

type FamilyFieldName = 'familyId' | 'familyName' | 'familyAccountNumber' | 'stationId';

type FieldMeta = {
  isTouched: boolean;
  isValid: boolean;
  errors: Array<{ message?: string } | undefined>;
};

type BoundField<TValue extends string> = {
  name: string;
  state: { value: TValue; meta: FieldMeta };
  handleBlur: () => void;
  handleChange: (value: TValue) => void;
};

type FarmerTypeForm = {
  setFieldValue: (name: FamilyFieldName, value: string) => void;
  Subscribe: <TSelected>(props: {
    selector: (state: { values: FarmerFormValues }) => TSelected;
    children: (selected: TSelected) => ReactNode;
  }) => ReactNode;
  Field: {
    (props: {
      name: 'accountType';
      children: (field: BoundField<FarmerAccountType>) => ReactNode;
    }): ReactNode;
    (props: {
      name: 'familyName' | 'familyAccountNumber' | 'familyId';
      children: (field: BoundField<string>) => ReactNode;
    }): ReactNode;
  };
};

function fieldInvalid(field: { state: { meta: FieldMeta } }) {
  return field.state.meta.errors.length > 0;
}

export function FarmerTypeFields<TForm extends object>({
  form: formProp,
  idPrefix = '',
  disabled,
  savedFamily,
}: {
  form: TForm;
  idPrefix?: string;
  disabled?: boolean;
  savedFamily?: FarmerFamily | null;
}) {
  const form = formProp as unknown as FarmerTypeForm;
  const {
    data: families,
    isPending: familiesPending,
    isError: familiesError,
    error: familiesErrorValue,
    refetch: refetchFamilies,
  } = useFarmerFamilies();

  return (
    <form.Field name="accountType">
      {(field) => {
        const isInvalid = fieldInvalid(field);
        return (
          <>
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={`${idPrefix}${field.name}`}>Farmer type</FieldLabel>
              <Select
                value={field.state.value}
                disabled={disabled}
                onValueChange={(next) => {
                  if (!next || !isFarmerAccountType(next)) return;
                  field.handleChange(next);
                  const cleared = fieldsClearedByAccountType(next);
                  for (const [name, value] of Object.entries(cleared)) {
                    form.setFieldValue(name as FamilyFieldName, value ?? '');
                  }
                }}
              >
                <SelectTrigger
                  id={`${idPrefix}${field.name}`}
                  className="w-full"
                  aria-invalid={isInvalid}
                  onBlur={field.handleBlur}
                >
                  <SelectValue placeholder="Select a farmer type" />
                </SelectTrigger>
                <SelectContent>
                  {FARMER_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
            </Field>

            {field.state.value === 'FAMILY_PRIMARY' ? (
              <>
                <form.Field name="familyName">
                  {(nameField) => {
                    const nameInvalid = fieldInvalid(nameField);
                    return (
                      <Field data-invalid={nameInvalid}>
                        <FieldLabel htmlFor={`${idPrefix}${nameField.name}`}>
                          Family name
                        </FieldLabel>
                        <Input
                          id={`${idPrefix}${nameField.name}`}
                          name={nameField.name}
                          value={nameField.state.value}
                          onBlur={nameField.handleBlur}
                          onChange={(event) => nameField.handleChange(event.target.value)}
                          aria-invalid={nameInvalid}
                          placeholder="e.g. Singh Family"
                          disabled={disabled}
                        />
                        {nameInvalid ? <FieldError errors={nameField.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>
                <form.Field name="familyAccountNumber">
                  {(accountField) => {
                    const accountInvalid = fieldInvalid(accountField);
                    return (
                      <Field data-invalid={accountInvalid}>
                        <FieldLabel htmlFor={`${idPrefix}${accountField.name}`}>
                          Family account number
                        </FieldLabel>
                        <Input
                          id={`${idPrefix}${accountField.name}`}
                          name={accountField.name}
                          value={accountField.state.value}
                          onBlur={accountField.handleBlur}
                          onChange={(event) =>
                            accountField.handleChange(
                              event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12),
                            )
                          }
                          aria-invalid={accountInvalid}
                          placeholder="e.g. 2001"
                          inputMode="numeric"
                          disabled={disabled}
                        />
                        {accountInvalid ? (
                          <FieldError errors={accountField.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>
              </>
            ) : null}

            {field.state.value === 'FAMILY_MEMBER' ? (
              <form.Subscribe selector={(state) => state.values.stationId}>
                {(stationId) => (
                  <form.Field name="familyId">
                    {(familyField) => {
                      const familyInvalid = fieldInvalid(familyField);
                      const options = familiesForStation(families ?? [], stationId, savedFamily);
                      return (
                        <Field data-invalid={familyInvalid}>
                          <FieldLabel htmlFor={`${idPrefix}${familyField.name}`}>Family</FieldLabel>
                          <SearchableOptionCombobox
                            id={`${idPrefix}${familyField.name}`}
                            name={familyField.name}
                            value={familyField.state.value}
                            onValueChange={(familyId) => {
                              familyField.handleChange(familyId);
                              const selected = options.find((family) => family.id === familyId);
                              if (selected?.stationId) {
                                form.setFieldValue('stationId', selected.stationId);
                              }
                            }}
                            onBlur={familyField.handleBlur}
                            isInvalid={familyInvalid}
                            placeholder={stationId ? 'Select family' : 'Select a station first'}
                            emptyMessage="No families for this station"
                            options={options.map((family) => ({
                              id: family.id,
                              label: family.accountNumber
                                ? `${family.name} · ${family.accountNumber}`
                                : family.name,
                            }))}
                            disabled={disabled || !stationId || familiesPending}
                          />
                          {familiesError ? (
                            <div className="flex flex-col gap-2">
                              <p className="text-sm text-destructive">
                                {getApiErrorMessage(familiesErrorValue, 'Could not load families.')}
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-fit"
                                onClick={() => void refetchFamilies()}
                              >
                                Try again
                              </Button>
                            </div>
                          ) : null}
                          {familyInvalid ? (
                            <FieldError errors={familyField.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                )}
              </form.Subscribe>
            ) : null}
          </>
        );
      }}
    </form.Field>
  );
}
