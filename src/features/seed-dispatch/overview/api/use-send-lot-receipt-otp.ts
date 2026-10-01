import { useMutation } from '@tanstack/react-query';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const OTP_RESEND_COOLDOWN_SECONDS = 60;

type SendLotReceiptOtpResponse = {
  success: boolean;
  data: {
    mobileNumber: string;
    maskedMobile: string;
    devOtp?: string;
    cooldownSeconds: number;
  };
};

export type SendLotReceiptOtpVariables = {
  lotId: string;
};

export function useSendLotReceiptOtp() {
  return useMutation({
    mutationKey: ['seed-dispatch', 'send-otp'],
    mutationFn: async ({ lotId }: SendLotReceiptOtpVariables) => {
      const { data } = await apiClient.post<SendLotReceiptOtpResponse>(
        `/v1/seed-dispatches/${lotId}/otp`,
      );
      return data.data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
  });
}

export function getLotReceiptErrorMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
