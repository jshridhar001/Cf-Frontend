import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AgreementLanguage } from '@/features/seed-requisition/contract/content/types';
import { seedRequisitionKeys } from '@/features/seed-requisition/overview/api/query-keys';
import type { SeedRequisitionDecisionResponse } from '@/features/seed-requisition/overview/types';
import { toSeedRequisition } from '@/features/seed-requisition/overview/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

const CONTRACT_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export function useUploadSeedRequisitionContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['seed-requisitions', 'upload-contract'],
    mutationFn: async ({
      requisitionId,
      language,
      file,
    }: {
      requisitionId: string;
      language: AgreementLanguage;
      file: File;
    }) => {
      if (file.size === 0) {
        throw new Error('File is required.');
      }
      if (file.size > CONTRACT_UPLOAD_MAX_BYTES) {
        throw new Error('File must be 10MB or smaller.');
      }

      const formData = new FormData();
      formData.append('file', file);
      const path =
        language === 'hi'
          ? `/v1/seed-requisitions/${requisitionId}/upload-hindi`
          : `/v1/seed-requisitions/${requisitionId}/upload`;
      const { data } = await apiClient.post<SeedRequisitionDecisionResponse>(path, formData, {
        headers: { 'Content-Type': false },
        timeout: 60_000,
      });
      return toSeedRequisition(data.data);
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (requisition, { language }) => {
      queryClient.setQueryData(seedRequisitionKeys.detail(requisition.id), requisition);
      await queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() });
      const label = language === 'hi' ? 'Hindi' : 'English';
      toast.success(`${label} contract uploaded`, {
        description: requisition.farmer?.name,
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
