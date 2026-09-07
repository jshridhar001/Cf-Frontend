import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import type { FarmerContractResponse } from '@/features/farmers/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const uploadFarmerContractMutationKey = [...farmersKeys.all, 'upload-contract'] as const;

export type UploadFarmerContractVariables = {
  farmerId: string;
  contractId: string;
  file: File;
};

export function useUploadFarmerContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: uploadFarmerContractMutationKey,
    mutationFn: async ({ farmerId, contractId, file }: UploadFarmerContractVariables) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await apiClient.post<FarmerContractResponse>(
        `/v1/farmers/${farmerId}/contracts/${contractId}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60_000 },
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { farmerId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.detail(farmerId) }),
      ]);
      toast.success(data.message || 'Contract uploaded successfully', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to upload contract. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
