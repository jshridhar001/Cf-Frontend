import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import type { NamedMasterResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type UpdateNamedMasterVariables = {
  id: string;
  name: string;
};

export function useUpdateNamedMaster(resourceId: AddressMasterId) {
  const queryClient = useQueryClient();
  const resource = getAddressMaster(resourceId);

  return useMutation({
    mutationKey: ['master', 'update-named-master', resourceId],
    mutationFn: async ({ id, name }: UpdateNamedMasterVariables) => {
      const { data } = await apiClient.put<NamedMasterResponse>(`${resource.path}/${id}`, {
        name,
      });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.addressMasters(resourceId) });
      toast.success(`${resource.singularTitle} updated successfully`, {
        description: `${item.name} was updated.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, `Failed to update ${resource.singular}. Please try again.`),
        { position: 'bottom-right' },
      );
    },
  });
}
