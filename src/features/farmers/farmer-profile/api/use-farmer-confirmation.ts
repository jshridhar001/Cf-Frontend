import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { farmersKeys } from '@/features/farmers/overview/api/query-keys';
import apiClient from '@/lib/api-client';

export type FarmerConfirmationStatus = {
  eligible: boolean;
  alreadyConfirmed: boolean;
  pendingCount: number;
  receivedCount: number;
  reason: string | null;
  maskedMobile: string | null;
  otpSentAt: string | null;
  verifiedAt: string | null;
  cooldownSeconds: number;
  otpLength: number;
  configured: boolean;
  configurationError: string | null;
};

type ConfirmationStatusResponse = {
  success: boolean;
  data: FarmerConfirmationStatus;
};

type SendConfirmationOtpResponse = {
  success: boolean;
  data: {
    maskedMobile: string;
    cooldownSeconds: number;
    otpLength: number;
  };
};

type VerifyConfirmationOtpResponse = {
  success: boolean;
  data: {
    verifiedAt: string;
  };
};

export function useFarmerConfirmation(farmerId: string) {
  return useQuery({
    queryKey: farmersKeys.confirmation(farmerId),
    queryFn: async () => {
      const { data } = await apiClient.get<ConfirmationStatusResponse>(
        `/v1/farmers/${farmerId}/confirmation`,
      );
      return data.data;
    },
    enabled: farmerId.length > 0,
    retry: false,
  });
}

export function useSendFarmerConfirmationOtp(farmerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['farmers', 'confirmation-otp', farmerId],
    mutationFn: async () => {
      const { data } = await apiClient.post<SendConfirmationOtpResponse>(
        `/v1/farmers/${farmerId}/confirmation-otp`,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: farmersKeys.confirmation(farmerId) });
    },
  });
}

export function useVerifyFarmerConfirmationOtp(farmerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['farmers', 'confirmation-otp-verify', farmerId],
    mutationFn: async (otp: string) => {
      const { data } = await apiClient.post<VerifyConfirmationOtpResponse>(
        `/v1/farmers/${farmerId}/confirmation-otp/verify`,
        { otp },
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmersKeys.confirmation(farmerId) }),
        queryClient.invalidateQueries({ queryKey: farmersKeys.list() }),
      ]);
    },
  });
}
