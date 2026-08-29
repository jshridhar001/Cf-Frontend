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
import { useUpdateFarmer } from '@/features/farmers/api/use-update-farmer';
import {
  FARMER_STATUSES,
  type Farmer,
  formatFarmerAccountType,
  formatFarmerStatus,
  isFarmerStatus,
} from '@/features/farmers/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(64),
  mobileNumber: z.string().min(8, 'Enter a valid mobile number.').max(20),
  status: z.enum(FARMER_STATUSES, { message: 'Select a status.' }),
  bankName: z.string().min(2, 'Bank name must be at least 2 characters.').max(64),
  ifscCode: z
    .string()
    .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Enter a valid 11-character IFSC code.'),
  bankAccountNumber: z
    .string()
    .regex(/^\d{8,18}$/, 'Enter a bank account number with 8 to 18 digits.'),
});

interface EditFarmerFormProps {
  farmer: Farmer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditFarmerForm({ farmer, onSuccess, onCancel }: EditFarmerFormProps) {
  const { mutateAsync: updateFarmer, isPending } = useUpdateFarmer();

  const form = useForm({
    defaultValues: {
      name: farmer.name,
      mobileNumber: farmer.mobileNumber,
      status: farmer.status,
      bankName: farmer.bankName ?? '',
      ifscCode: farmer.ifscCode ?? '',
      bankAccountNumber: farmer.bankAccountNumber ?? '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isFarmerStatus(value.status)) return;
      await updateFarmer({
        farmerId: farmer.id,
        name: value.name.trim(),
        mobileNumber: value.mobileNumber.trim(),
        status: value.status,
        bankName: value.bankName.trim(),
        ifscCode: value.ifscCode.trim().toUpperCase(),
        bankAccountNumber: value.bankAccountNumber.trim(),
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
        <Field>
          <FieldLabel htmlFor="edit-accountType">Account type</FieldLabel>
          <Input
            id="edit-accountType"
            value={formatFarmerAccountType(farmer.accountType)}
            disabled
            readOnly
          />
        </Field>

        {farmer.accountType === 'FAMILY_MEMBER' || farmer.accountType === 'FAMILY_PRIMARY' ? (
          <>
            <Field>
              <FieldLabel htmlFor="edit-familyName">Family name</FieldLabel>
              <Input
                id="edit-familyName"
                value={farmer.family?.name ?? farmer.familyName ?? ''}
                disabled
                readOnly
              />
            </Field>
            {farmer.family?.accountNumber || farmer.familyAccountNumber ? (
              <Field>
                <FieldLabel htmlFor="edit-familyAccountNumber">Family account number</FieldLabel>
                <Input
                  id="edit-familyAccountNumber"
                  value={farmer.family?.accountNumber ?? farmer.familyAccountNumber ?? ''}
                  disabled
                  readOnly
                />
              </Field>
            ) : null}
          </>
        ) : null}

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

        <form.Field name="status">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`edit-${field.name}`}>Status</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  disabled={isPending}
                  onValueChange={(value) => {
                    if (value && isFarmerStatus(value)) field.handleChange(value);
                  }}
                >
                  <SelectTrigger
                    id={`edit-${field.name}`}
                    aria-invalid={isInvalid}
                    className="w-full"
                  >
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
                  onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                  aria-invalid={isInvalid}
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
                <FieldLabel htmlFor={`edit-${field.name}`}>Bank account number</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value.replace(/\s/g, ''))}
                  aria-invalid={isInvalid}
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
        <Button type="button" variant="outline" disabled={isPending} onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
