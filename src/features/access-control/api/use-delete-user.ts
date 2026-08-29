import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accessControlKeys } from '@/features/access-control/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const deleteUserMutationKey = [...accessControlKeys.all, 'delete-user'] as const;

type DeleteUserResponse = {
  success: boolean;
  message: string;
};

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteUserMutationKey,
    mutationFn: async (userId: string) => {
      const { data } = await apiClient.delete<DeleteUserResponse>(
        `/v1/access-control/users/${userId}`,
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: accessControlKeys.users() });
      toast.success(data.message || 'User deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete user. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
