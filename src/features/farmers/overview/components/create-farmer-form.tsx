import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateFarmer } from '@/features/farmers/overview/api/use-create-farmer';
import { useFarmerFamilies } from '@/features/farmers/overview/api/use-farmer-families';
import { FarmerAddressFields } from '@/features/farmers/overview/components/farmer-address-fields';
import {
  emptyFarmerAddress,
  farmerAreaCascade,
  FARMER_ACCOUNT_TYPES,
  FARMER_STATUSES,
  type FarmerAccountType,
  type FarmerAddressValues,
  type FarmerStatus,
  formatFarmerAccountType,
  formatFarmerStatus,
  isFarmerAccountType,
  isFarmerStatus,
} from '@/features/farmers/overview/types';

const optionalText = z.string();

const formSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters.').max(64),
    accountNumber: z.string().min(1, 'Account number is required.').max(32),
    mobileNumber: z.string().min(8, 'Enter a valid mobile number.').max(20),
    aadharNumber: optionalText.refine((value) => !value || /^\d{12}$/.test(value), {
      message: 'Aadhaar must be 12 digits.',
    }),
    panNumber: optionalText.refine((value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(value), {
      message: 'Enter a valid PAN (ABCDE1234F).',
    }),
    accountType: z.enum(FARMER_ACCOUNT_TYPES, { message: 'Select an account type.' }),
    status: z.enum(FARMER_STATUSES, { message: 'Select a status.' }),
    stateId: z.string(),
    districtId: z.string(),
    postOfficeId: z.string(),
    policeStationId: z.string(),
    villageId: z.string(),
    areaId: z.string().min(1, 'Area is required.'),
    familyId: z.string(),
    familyName: z.string(),
    familyAccountNumber: z.string(),
    contractUrl: optionalText.refine((value) => !value || URL.canParse(value), {
      message: 'Enter a valid URL.',
    }),
    bankName: z.string().min(2, 'Bank name must be at least 2 characters.').max(64),
    ifscCode: z
      .string()
      .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Enter a valid 11-character IFSC code.'),
    bankAccountNumber: z
      .string()
      .regex(/^\d{8,18}$/, 'Enter a bank account number with 8 to 18 digits.'),
  })
  .superRefine((value, ctx) => {
    if (value.accountType === 'FAMILY_PRIMARY') {
      if (!value.familyName.trim()) {
        ctx.addIssue({ code: 'custom', path: ['familyName'], message: 'Family name is required.' });
      }
      if (!value.familyAccountNumber.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['familyAccountNumber'],
          message: 'Family account number is required.',
        });
      }
    }
    if (value.accountType === 'FAMILY_MEMBER' && !value.familyId) {
      ctx.addIssue({ code: 'custom', path: ['familyId'], message: 'Select a family.' });
    }
  });

interface CreateFarmerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateFarmerForm({ onSuccess, onCancel }: CreateFarmerFormProps) {
  const { mutateAsync: createFarmer, isPending } = useCreateFarmer();
  const { data: families = [] } = useFarmerFamilies();

  const form = useForm({
    defaultValues: {
      name: '',
      accountNumber: '',
      mobileNumber: '',
      aadharNumber: '',
      panNumber: '',
      accountType: 'INDIVIDUAL' as FarmerAccountType,
      status: 'ACTIVE' as FarmerStatus,
      ...emptyFarmerAddress(),
      familyId: '',
      familyName: '',
      familyAccountNumber: '',
      contractUrl: '',
      bankName: '',
      ifscCode: '',
      bankAccountNumber: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isFarmerAccountType(value.accountType) || !isFarmerStatus(value.status)) return;

      await createFarmer({
        name: value.name.trim(),
        accountNumber: value.accountNumber.trim(),
        mobileNumber: value.mobileNumber.trim(),
        accountType: value.accountType,
        status: value.status,
        areaId: value.areaId,
        bankName: value.bankName.trim(),
        ifscCode: value.ifscCode.trim().toUpperCase(),
        bankAccountNumber: value.bankAccountNumber.trim(),
        ...(value.aadharNumber.trim() ? { aadharNumber: value.aadharNumber.trim() } : {}),
        ...(value.panNumber.trim() ? { panNumber: value.panNumber.trim().toUpperCase() } : {}),
        ...(value.contractUrl.trim() ? { contractUrl: value.contractUrl.trim() } : {}),
        ...(value.accountType === 'FAMILY_PRIMARY'
          ? {
              familyName: value.familyName.trim(),
              familyAccountNumber: value.familyAccountNumber.trim(),
            }
          : {}),
        ...(value.accountType === 'FAMILY_MEMBER' ? { familyId: value.familyId } : {}),
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
        <form.Field name="accountType">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Account type</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  disabled={isPending}
                  onValueChange={(value) => {
                    if (!value || !isFarmerAccountType(value)) return;
                    field.handleChange(value);
                    form.setFieldValue('familyId', '');
                    form.setFieldValue('familyName', '');
                    form.setFieldValue('familyAccountNumber', '');
                  }}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid} className="w-full">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FARMER_ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatFarmerAccountType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.accountType}>
          {(accountType) =>
            accountType === 'FAMILY_MEMBER' ? (
              <form.Field name="familyId">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Family</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value || undefined}
                        disabled={isPending}
                        onValueChange={(value) => {
                          if (!value) return;
                          field.handleChange(value);
                          const family = families.find((item) => item.id === value);
                          if (family) {
                            const cascade = farmerAreaCascade(family.area);
                            form.setFieldValue('stateId', cascade.stateId);
                            form.setFieldValue('districtId', cascade.districtId);
                            form.setFieldValue('postOfficeId', cascade.postOfficeId);
                            form.setFieldValue('policeStationId', cascade.policeStationId);
                            form.setFieldValue('villageId', cascade.villageId);
                            form.setFieldValue('areaId', family.areaId || cascade.areaId);
                          }
                        }}
                      >
                        <SelectTrigger id={field.name} aria-invalid={isInvalid} className="w-full">
                          <SelectValue placeholder="Select a family" />
                        </SelectTrigger>
                        <SelectContent>
                          {families.map((family) => (
                            <SelectItem key={family.id} value={family.id}>
                              {family.name}
                              {family.accountNumber ? ` (${family.accountNumber})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Address is taken from the parent family.
                      </FieldDescription>
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  );
                }}
              </form.Field>
            ) : accountType === 'FAMILY_PRIMARY' ? (
              <>
                <form.Field name="familyName">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Family name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Singh Family"
                          disabled={isPending}
                        />
                        {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>
                <form.Field name="familyAccountNumber">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Family account number</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="FAM-2001"
                          disabled={isPending}
                        />
                        {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>
              </>
            ) : null
          }
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
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Ramesh Kumar"
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
                  placeholder="F-1001"
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
                  placeholder="9876543210"
                  autoComplete="tel"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.accountType}>
          {(accountType) => {
            const lockPlace = accountType === 'FAMILY_MEMBER';
            return (
              <form.Subscribe
                selector={(state) => ({
                  stateId: state.values.stateId,
                  districtId: state.values.districtId,
                  postOfficeId: state.values.postOfficeId,
                  policeStationId: state.values.policeStationId,
                  villageId: state.values.villageId,
                  areaId: state.values.areaId,
                })}
              >
                {(address) => (
                  <form.Field name="areaId">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <FarmerAddressFields
                          values={address}
                          disabled={isPending || lockPlace}
                          areaError={isInvalid ? 'Area is required.' : undefined}
                          description={
                            lockPlace ? 'Address comes from the parent family.' : undefined
                          }
                          onChange={(next: FarmerAddressValues) => {
                            form.setFieldValue('stateId', next.stateId);
                            form.setFieldValue('districtId', next.districtId);
                            form.setFieldValue('postOfficeId', next.postOfficeId);
                            form.setFieldValue('policeStationId', next.policeStationId);
                            form.setFieldValue('villageId', next.villageId);
                            field.handleChange(next.areaId);
                          }}
                        />
                      );
                    }}
                  </form.Field>
                )}
              </form.Subscribe>
            );
          }}
        </form.Subscribe>

        <form.Field name="status">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  disabled={isPending}
                  onValueChange={(value) => {
                    if (value && isFarmerStatus(value)) field.handleChange(value);
                  }}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid} className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {FARMER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatFarmerStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  placeholder="123456789012"
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
                <FieldLabel htmlFor={field.name}>PAN (optional)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value.toUpperCase().slice(0, 10))}
                  aria-invalid={isInvalid}
                  placeholder="ABCDE1234F"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="contractUrl">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Contract URL (optional)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="https://example.com/contracts/ramesh.pdf"
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
                  onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
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
                  onChange={(e) => field.handleChange(e.target.value.replace(/\s/g, ''))}
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
              {isPending ? 'Creating…' : 'Add farmer'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
