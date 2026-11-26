import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useFarmerConfirmation,
  useSendFarmerConfirmationOtp,
  useVerifyFarmerConfirmationOtp,
} from '@/features/farmers/farmer-profile/api/use-farmer-confirmation';
import { getApiErrorMessage } from '@/lib/api-client';

type FarmerConfirmationDialogProps = {
  farmerId: string;
  farmerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FarmerConfirmationDialog({
  farmerId,
  farmerName,
  open,
  onOpenChange,
}: FarmerConfirmationDialogProps) {
  const confirmation = useFarmerConfirmation(farmerId);
  const sendOtp = useSendFarmerConfirmationOtp(farmerId);
  const verifyOtp = useVerifyFarmerConfirmationOtp(farmerId);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState('');
  const [otpLength, setOtpLength] = useState(6);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [restoredForOpen, setRestoredForOpen] = useState(false);

  const isSending = sendOtp.isPending;
  const isConfirming = verifyOtp.isPending;
  const status = confirmation.data;

  useEffect(() => {
    if (open) return;
    setOtp('');
    setOtpSent(false);
    setMaskedMobile('');
    setOtpLength(6);
    setError(null);
    setCooldownRemaining(0);
    setRestoredForOpen(false);
    sendOtp.reset();
    verifyOtp.reset();
  }, [open, sendOtp.reset, verifyOtp.reset]);

  useEffect(() => {
    if (!open || restoredForOpen || !status) return;
    const outstanding =
      status.otpSentAt != null &&
      (status.verifiedAt == null || status.otpSentAt > status.verifiedAt);
    if (outstanding) {
      setOtpSent(true);
      setMaskedMobile(status.maskedMobile ?? '');
      setCooldownRemaining(status.cooldownSeconds);
    }
    setOtpLength(status.otpLength);
    setRestoredForOpen(true);
  }, [open, restoredForOpen, status]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldownRemaining]);

  async function handleSendOtp() {
    setError(null);
    try {
      const result = await sendOtp.mutateAsync();
      setOtpSent(true);
      setMaskedMobile(result.maskedMobile);
      setOtpLength(result.otpLength);
      setCooldownRemaining(result.cooldownSeconds);
      toast.success('OTP sent', {
        description: `Sent to ${result.maskedMobile}`,
      });
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to send OTP');
      setError(message);
      toast.error('Failed to send OTP', { description: message });
    }
  }

  async function handleConfirm() {
    setError(null);
    try {
      await verifyOtp.mutateAsync(otp);
      toast.success('Farmer confirmed', {
        description: farmerName,
      });
      onOpenChange(false);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not confirm the OTP');
      setError(message);
      toast.error('Could not confirm the OTP', { description: message });
    }
  }

  const displayMobile = maskedMobile || status?.maskedMobile || '';
  const canResend = otpSent && cooldownRemaining === 0 && !isSending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Final confirmation</DialogTitle>
          <DialogDescription>
            Send one OTP to {farmerName}. Enter the code they read back from the SMS.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {displayMobile ? (
            <div>
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="font-medium tabular-nums">{displayMobile}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="farmer-confirmation-otp">OTP</Label>
            <Input
              id="farmer-confirmation-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={otpLength}
              placeholder={`${otpLength}-digit code`}
              value={otp}
              disabled={!otpSent || isConfirming}
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, '').slice(0, otpLength);
                setOtp(next);
              }}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending || isConfirming}
          >
            Cancel
          </Button>
          {!otpSent ? (
            <Button type="button" onClick={() => void handleSendOtp()} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSendOtp()}
                disabled={!canResend}
              >
                {cooldownRemaining > 0
                  ? `Resend in ${cooldownRemaining}s`
                  : isSending
                    ? 'Sending…'
                    : 'Resend OTP'}
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={otp.length !== otpLength || isConfirming || isSending}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
