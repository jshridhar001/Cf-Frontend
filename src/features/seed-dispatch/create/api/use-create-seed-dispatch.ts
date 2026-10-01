import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateDispatchInput } from '@/features/seed-dispatch/create/lib/dispatch.schema';
import { toCreateSeedDispatchBody } from '@/features/seed-dispatch/create/lib/to-create-dispatch-body';
import type { SeedDispatchCreateResponse } from '@/features/seed-dispatch/create/types';
import { seedDispatchKeys } from '@/features/seed-dispatch/overview/api/query-keys';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export type CreateSeedDispatchVariables = CreateDispatchInput;

export function useCreateSeedDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-dispatch', 'create'],
    mutationFn: async (variables: CreateSeedDispatchVariables) => {
      const body = toCreateSeedDispatchBody(variables);
      const { data } = await apiClient.post<SeedDispatchCreateResponse>(
        '/v1/seed-dispatches',
        body,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (dispatch) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.list() }),
        queryClient.invalidateQueries({ queryKey: seedDispatchKeys.dispatchable() }),
        queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() }),
      ]);
      toast.success('Dispatch created', {
        description: `Truck ${dispatch.truckNumber} — ${dispatch.toLocation}`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create seed dispatch. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
