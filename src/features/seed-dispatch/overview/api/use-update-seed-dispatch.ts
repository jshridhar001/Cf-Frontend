import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import type { UpdateSeedDispatchBody } from '@/features/seed-dispatch/overview/lib/edit-dispatch';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

type UpdateSeedDispatchResponse = {
  success: boolean;
  data: SeedDispatch;
};

export type UpdateSeedDispatchVariables = {
  dispatchId: string;
  body: UpdateSeedDispatchBody;
};

export function useUpdateSeedDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-dispatch', 'update'],
    mutationFn: async ({ dispatchId, body }: UpdateSeedDispatchVariables) => {
      const { data } = await apiClient.put<UpdateSeedDispatchResponse>(
        `/v1/seed-dispatches/${dispatchId}`,
        body,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (dispatch) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.list() }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.detail(dispatch.id) }),
      ]);
      const truck = dispatch.truckNumber?.trim();
      const destination = dispatch.toLocation?.trim();
      toast.success('Dispatch updated', {
        description:
          truck && destination ? `Truck ${truck} — ${destination}` : (truck ?? destination),
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update dispatch. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
