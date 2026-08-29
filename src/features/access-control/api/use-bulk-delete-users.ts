import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accessControlKeys } from '@/features/access-control/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const bulkDeleteUsersMutationKey = [...accessControlKeys.all, 'bulk-delete-users'] as const;

export type BulkDeleteUsersVariables = {
  userIds: string[];
};

type BulkDeleteUsersResponse = {
  success: boolean;
  message: string;
};

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: bulkDeleteUsersMutationKey,
    mutationFn: async ({ userIds }: BulkDeleteUsersVariables) => {
      const { data } = await apiClient.delete<BulkDeleteUsersResponse>(
        '/v1/access-control/users/bulk',
        { data: { userIds } },
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: accessControlKeys.users() });
      toast.success(data.message || 'Users deleted successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete users. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
