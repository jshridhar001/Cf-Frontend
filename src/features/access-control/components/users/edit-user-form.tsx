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
import { useUpdateUser } from '@/features/access-control/api/use-update-user';
import type { AccessControlUser } from '@/features/types';
import { formatRoleLabel } from './columns';

const EDIT_USER_ROLES = [
  { label: 'Managing Director', value: 'MANAGING_DIRECTOR' },
  { label: 'Programme Manager', value: 'PROGRAMME_MANAGER' },
  { label: 'Accounts Settlements Manager', value: 'ACCOUNTS_SETTLEMENTS_MANAGER' },
  { label: 'Field Operations Manager', value: 'FIELD_OPERATIONS_MANAGER' },
  { label: 'Accounts Seeds Supply Manager', value: 'ACCOUNTS_SEEDS_SUPPLY_MANAGER' },
  { label: 'Field Officer', value: 'FIELD_OFFICER' },
] as const;

type EditUserRole = (typeof EDIT_USER_ROLES)[number]['value'] | string;

function isEditUserRole(value: string, extra?: string): boolean {
  return EDIT_USER_ROLES.some((role) => role.value === value) || value === extra;
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(64, 'Name must be at most 64 characters.'),
  email: z.email('Enter a valid email address.'),
  role: z.string().min(1, 'Please select a role.'),
});

export type EditUserFormValues = {
  name: string;
  email: string;
  role: EditUserRole;
};

interface EditUserFormProps {
  user: AccessControlUser;
  onSuccess?: (values: EditUserFormValues) => void;
  onCancel?: () => void;
}

export function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const roleOptions = isEditUserRole(user.role)
    ? EDIT_USER_ROLES
    : [...EDIT_USER_ROLES, { label: formatRoleLabel(user.role), value: user.role }];

  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isEditUserRole(value.role, user.role)) return;

      const submitted: EditUserFormValues = {
        name: value.name,
        email: value.email,
        role: value.role,
      };

      await updateUser({
        userId: user.id,
        name: submitted.name,
        email: submitted.email,
        role: submitted.role,
      });
      onSuccess?.(submitted);
    },
  });

  return (
    <form
      id="edit-user-form"
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
                <FieldLabel htmlFor={`edit-${field.name}`}>Email</FieldLabel>
                <Input
                  id={`edit-${field.name}`}
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

        <form.Field name="role">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`edit-${field.name}`}>Role</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value || undefined}
                  onValueChange={(value) => field.handleChange(value ?? '')}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id={`edit-${field.name}`}
                    aria-invalid={isInvalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
