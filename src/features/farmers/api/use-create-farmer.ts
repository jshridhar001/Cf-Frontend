import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { farmersKeys } from '@/features/farmers/api/query-keys';
import type { FarmerAccountType, FarmerResponse, FarmerStatus } from '@/features/farmers/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const createFarmerMutationKey = [...farmersKeys.all, 'create'] as const;

export type CreateFarmerVariables = {
  name: string;
  accountNumber: string;
  mobileNumber: string;
  aadharNumber?: string;
  panNumber?: string;
  accountType: FarmerAccountType;
  status: FarmerStatus;
  stationId: string;
  localityId: string;
  contractUrl?: string;
  bankName: string;
  ifscCode: string;
  bankAccountNumber: string;
  familyName?: string;
  familyAccountNumber?: string;
  familyId?: string;
};

function compactBody(variables: CreateFarmerVariables) {
  return {
    name: variables.name,
    accountNumber: variables.accountNumber,
    mobileNumber: variables.mobileNumber,
    accountType: variables.accountType,
    status: variables.status,
    stationId: variables.stationId,
    localityId: variables.localityId,
    bankName: variables.bankName,
    ifscCode: variables.ifscCode,
    bankAccountNumber: variables.bankAccountNumber,
    ...(variables.aadharNumber ? { aadharNumber: variables.aadharNumber } : {}),
    ...(variables.panNumber ? { panNumber: variables.panNumber } : {}),
    ...(variables.contractUrl ? { contractUrl: variables.contractUrl } : {}),
    ...(variables.familyName ? { familyName: variables.familyName } : {}),
    ...(variables.familyAccountNumber
      ? { familyAccountNumber: variables.familyAccountNumber }
      : {}),
    ...(variables.familyId ? { familyId: variables.familyId } : {}),
  };
}

export function useCreateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createFarmerMutationKey,
    mutationFn: async (variables: CreateFarmerVariables) => {
      const { data } = await apiClient.post<FarmerResponse>('/v1/farmers', compactBody(variables));
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async (farmer) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.families() }),
      ]);
      toast.success('Farmer created successfully', {
        description: `${farmer.name} was added.`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create farmer. Please try again.'), {
        position: 'bottom-right',
      });
    },
  });
}
