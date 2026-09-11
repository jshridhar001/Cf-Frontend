import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ContractLanguage } from '@/features/farmers/contract/lib/contract-language';
import type { FarmerContractResponse } from '@/features/farmers/contract/types';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const uploadFarmerContractMutationKey = [...farmersKeys.all, 'upload-contract'] as const;

export type UploadFarmerContractVariables = {
  farmerId: string;
  contractId: string;
  file: File;
  language: ContractLanguage;
};

function uploadPath(farmerId: string, contractId: string, language: ContractLanguage) {
  const suffix = language === 'hindi' ? 'upload-hindi' : 'upload';
  return `/v1/farmers/${farmerId}/contracts/${contractId}/${suffix}`;
}

export function useUploadFarmerContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: uploadFarmerContractMutationKey,
    mutationFn: async ({ farmerId, contractId, file, language }: UploadFarmerContractVariables) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await apiClient.post<FarmerContractResponse>(
        uploadPath(farmerId, contractId, language),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60_000 },
      );
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (data, { farmerId, language }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.detail(farmerId) }),
      ]);
      const fallback =
        language === 'hindi'
          ? 'Hindi contract uploaded successfully'
          : 'Contract uploaded successfully';
      toast.success(data.message || fallback, {
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
