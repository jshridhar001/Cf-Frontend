import { useMutation } from '@tanstack/react-query';

import type { SendLotReceiptOtpResponse } from '@/features/seed-dispatch/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';

export const OTP_RESEND_COOLDOWN_SECONDS = 45;

export type SendLotReceiptOtpVariables = {
  lotId: string;
};

export function useSendLotReceiptOtp() {
  return useMutation({
    mutationKey: ['dispatch-lots', 'send-otp'],
    mutationFn: async ({ lotId }: SendLotReceiptOtpVariables) => {
      const { data } = await apiClient.post<SendLotReceiptOtpResponse>(
        `/dispatch-lots/${lotId}/otp`,
      );
      if (!data.ok) {
        throw new Error(data.error);
      }
      return data;
    },
    retry: false,
    meta: { suppressGlobalError: true },
  });
}

export function getLotReceiptErrorMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
