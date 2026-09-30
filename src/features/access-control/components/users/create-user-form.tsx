import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateUser } from '@/features/access-control/api/use-create-user';

const CREATE_USER_ROLES = [
  { label: 'Programme Manager', value: 'PROGRAMME_MANAGER' },
  { label: 'Accounts Settlements Manager', value: 'ACCOUNTS_SETTLEMENTS_MANAGER' },
  { label: 'Field Operations Manager', value: 'FIELD_OPERATIONS_MANAGER' },
  { label: 'Accounts Seeds Supply Manager', value: 'ACCOUNTS_SEEDS_SUPPLY_MANAGER' },
  { label: 'Field Officer', value: 'FIELD_OFFICER' },
] as const;

type CreateUserRole = (typeof CREATE_USER_ROLES)[number]['value'];

function isCreateUserRole(value: string): value is CreateUserRole {
  return CREATE_USER_ROLES.some((role) => role.value === value);
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(64, 'Name must be at most 64 characters.'),
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be at most 128 characters.'),
  role: z.string().refine(isCreateUserRole, { message: 'Please select a role.' }),
});

export type CreateUserFormValues = {
  name: string;
  email: string;
  password: string;
  role: CreateUserRole;
};

interface CreateUserFormProps {
  onSuccess?: (values: CreateUserFormValues) => void;
  onCancel?: () => void;
}

export function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const { mutateAsync: createUser, isPending } = useCreateUser();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isCreateUserRole(value.role)) return;

      const submitted: CreateUserFormValues = {
        name: value.name,
        email: value.email,
        password: value.password,
        role: value.role,
      };

      await createUser(submitted);
      form.reset();
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="create-user-form"
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
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="ada@example.com"
                  autoComplete="email"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isPending}
                />
                <FieldDescription>Must be at least 8 characters.</FieldDescription>
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="role">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                <SearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(next) => {
                    if (isCreateUserRole(next)) field.handleChange(next);
                  }}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select a role"
                  emptyMessage="No roles found"
                  disabled={isPending}
                  options={CREATE_USER_ROLES.map((role) => ({
                    id: role.value,
                    label: role.label,
                  }))}
                />
                <FieldDescription>
                  Determines what this user can access on the platform.
                </FieldDescription>
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
              {isPending ? 'Creating…' : 'Create User'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
