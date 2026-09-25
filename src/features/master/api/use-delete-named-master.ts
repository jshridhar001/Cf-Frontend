import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import type { NamedMasterMessageResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export function useDeleteNamedMaster(resourceId: AddressMasterId) {
  const queryClient = useQueryClient();
  const resource = getAddressMaster(resourceId);

  return useMutation({
    mutationKey: ['master', 'delete-named-master', resourceId],
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<NamedMasterMessageResponse>(`${resource.path}/${id}`);
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.addressMasters(resourceId) });
      toast.success(data.message || `${resource.singularTitle} deleted successfully`, {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, `Failed to delete ${resource.singular}. Please try again.`),
        { position: 'bottom-right' },
      );
    },
  });
}
