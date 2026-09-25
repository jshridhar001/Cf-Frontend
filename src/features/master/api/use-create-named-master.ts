import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { masterKeys } from '@/features/master/api/query-keys';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import type { NamedMasterResponse } from '@/features/master/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateNamedMasterVariables = {
  name: string;
};

export function useCreateNamedMaster(resourceId: AddressMasterId) {
  const queryClient = useQueryClient();
  const resource = getAddressMaster(resourceId);

  return useMutation({
    mutationKey: ['master', 'create-named-master', resourceId],
    mutationFn: async ({ name }: CreateNamedMasterVariables) => {
      const { data } = await apiClient.post<NamedMasterResponse>(resource.path, { name });
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: masterKeys.addressMasters(resourceId) });
      toast.success(`${resource.singularTitle} created successfully`, {
        description: `${item.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, `Failed to create ${resource.singular}. Please try again.`),
        { position: 'bottom-right' },
      );
    },
  });
}
