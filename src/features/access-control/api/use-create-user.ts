import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accessControlKeys } from '@/features/access-control/api/query-keys';
import { authClient } from '@/features/auth/lib/auth-client';

export const createUserMutationKey = [...accessControlKeys.all, 'create-user'] as const;

export type CreateUserVariables = {
  name: string;
  email: string;
  password: string;
  role: string;
};

function getCreateUserErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybe = error as {
      code?: string;
      message?: string;
      error?: { code?: string; message?: string };
    };
    const code = maybe.code ?? maybe.error?.code;
    const message = maybe.message ?? maybe.error?.message;

    if (code === 'USER_ALREADY_EXISTS' || code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
      return 'A user with this email already exists.';
    }
    if (code === 'YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS') {
      return 'You are not allowed to create users.';
    }
    if (code === 'FAILED_TO_CREATE_USER') {
      return 'Failed to create user. Please try again.';
    }
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Failed to create user. Please try again.';
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createUserMutationKey,
    mutationFn: async ({ name, email, password, role }: CreateUserVariables) => {
      // Better Auth's default admin client types only know "admin" | "user";
      // our backend uses custom role strings.
      const result = await authClient.admin.createUser({
        name,
        email,
        password,
        role: role as 'admin' | 'user',
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: accessControlKeys.users() });
      toast.success('User created successfully', {
        description: `${variables.name} (${variables.email}) was added as ${variables.role}.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getCreateUserErrorMessage(error), { position: 'bottom-right' });
    },
  });
}
