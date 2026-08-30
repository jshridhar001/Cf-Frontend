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
import { useCreateFarmerContract } from '@/features/farmers/api/use-create-farmer-contract';
import { useUpdateFarmerContract } from '@/features/farmers/api/use-update-farmer-contract';
import {
  type Farmer,
  type FarmerContractRow,
  formatContractAcresPayload,
} from '@/features/farmers/types';
import { useVarieties } from '@/features/master/api/use-varieties';

const formSchema = z.object({
  farmerId: z.string().min(1, 'Select a farmer.'),
  variety: z.string().min(1, 'Select a variety.'),
  date: z.string().min(1, 'Date is required.'),
  acres: z
    .string()
    .min(1, 'Acres is required.')
    .refine((value) => {
      const n = Number(value);
      return Number.isFinite(n) && n > 0;
    }, 'Enter acres greater than 0.'),
  contractUrl: z
    .string()
    .min(1, 'Contract URL is required.')
    .refine((value) => URL.canParse(value), 'Enter a valid URL.'),
});

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

interface ContractFormProps {
  farmers: Farmer[];
  contract?: FarmerContractRow | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContractForm({ farmers, contract, onSuccess, onCancel }: ContractFormProps) {
  const isEdit = contract != null;
  const { mutateAsync: createContract, isPending: isCreating } = useCreateFarmerContract();
  const { mutateAsync: updateContract, isPending: isUpdating } = useUpdateFarmerContract();
  const { data: varieties = [] } = useVarieties();
  const isPending = isCreating || isUpdating;

  const varietyNames = Array.from(
    new Set(
      [
        ...varieties.map((variety) => variety.name),
        ...(contract?.variety ? [contract.variety] : []),
      ]
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  );

  const form = useForm({
    defaultValues: {
      farmerId: contract?.farmerId ?? '',
      variety: contract?.variety ?? '',
      date: contract?.date ? contract.date.slice(0, 10) : todayIsoDate(),
      acres: contract ? String(contract.acres) : '',
      contractUrl: contract?.contractUrl ?? '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const body = {
        variety: value.variety.trim(),
        date: value.date,
        acres: formatContractAcresPayload(value.acres),
        contractUrl: value.contractUrl.trim(),
      };

      if (isEdit) {
        await updateContract({
          farmerId: contract.farmerId,
          contractId: contract.id,
          ...body,
        });
      } else {
        await createContract({
          farmerId: value.farmerId,
          ...body,
        });
        form.reset();
      }
      onSuccess?.();
    },
  });

  return (
    <form
      id={isEdit ? 'edit-contract-form' : 'create-contract-form'}
      className="min-w-0 max-w-full overflow-x-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="farmerId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            const selectedFarmer = farmers.find((farmer) => farmer.id === field.state.value);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Farmer</FieldLabel>
                {isEdit ? (
                  <Input
                    id={field.name}
                    value={contract.farmerName || selectedFarmer?.name || ''}
                    disabled
                    readOnly
                  />
                ) : (
                  <Select
                    name={field.name}
                    value={field.state.value}
                    disabled={isPending}
                    onValueChange={(value) => {
                      if (value) field.handleChange(value);
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={isInvalid}
                      className="w-full min-w-0"
                    >
                      <SelectValue placeholder="Select farmer" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          {farmer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="variety">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Variety</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  disabled={isPending}
                  onValueChange={(value) => {
                    if (value) field.handleChange(value);
                  }}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={isInvalid}
                    className="w-full min-w-0"
                  >
                    <SelectValue placeholder="Select variety" />
                  </SelectTrigger>
                  <SelectContent>
                    {varietyNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="date">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  className="max-w-full [&::-webkit-calendar-picker-indicator]:shrink-0 [&::-webkit-datetime-edit]:min-w-0"
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

        <form.Field name="acres">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Acres</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="decimal"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="2.50"
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
                <FieldLabel htmlFor={field.name}>Contract URL</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="https://example.com/contracts/ramesh.pdf"
                  autoComplete="off"
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
              {isPending
                ? isEdit
                  ? 'Saving…'
                  : 'Creating…'
                : isEdit
                  ? 'Save changes'
                  : 'Create contract'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
