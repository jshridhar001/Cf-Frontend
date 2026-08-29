import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accessControlKeys } from '@/features/access-control/api/query-keys';
import type { AccessControlUser } from '@/features/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const updateUserMutationKey = [...accessControlKeys.all, 'update-user'] as const;

export type UpdateUserBody = {
  name?: string;
  email?: string;
  role?: string;
  emailVerified?: boolean;
  image?: string | null;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: string | null;
};

export type UpdateUserVariables = UpdateUserBody & {
  userId: string;
};

type AccessControlUserResponse = {
  success: boolean;
  data: AccessControlUser;
};

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateUserMutationKey,
    mutationFn: async ({ userId, ...body }: UpdateUserVariables) => {
      const { data } = await apiClient.patch<AccessControlUserResponse>(
        `/v1/access-control/users/${userId}`,
        body,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: accessControlKeys.users() });
      toast.success('User updated successfully', {
        description: `${user.name} (${user.email}) was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update user. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
