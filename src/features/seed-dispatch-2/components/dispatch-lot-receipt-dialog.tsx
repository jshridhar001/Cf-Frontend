import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { useConfirmLotReceipt } from '@/features/seed-dispatch/api/use-confirm-lot-receipt';
import {
  getLotReceiptErrorMessage,
  OTP_RESEND_COOLDOWN_SECONDS,
  useSendLotReceiptOtp,
} from '@/features/seed-dispatch/api/use-send-lot-receipt-otp';
import type { SeedDispatchLot } from '@/features/seed-dispatch/types';

type DispatchLotReceiptDialogProps = {
  lot: SeedDispatchLot | null;
  dispatchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DispatchLotReceiptDialog({
  lot,
  dispatchId,
  open,
  onOpenChange,
}: DispatchLotReceiptDialogProps) {
  const sendOtp = useSendLotReceiptOtp();
  const confirmReceipt = useConfirmLotReceipt();
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const isSending = sendOtp.isPending;
  const isConfirming = confirmReceipt.isPending;

  useEffect(() => {
    if (open) return;
    setOtp('');
    setDevOtp(null);
    setOtpSent(false);
    setMaskedMobile('');
    setError(null);
    setCooldownRemaining(0);
    sendOtp.reset();
    confirmReceipt.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when dialog closes
  }, [open]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldownRemaining]);

  async function handleSendOtp() {
    if (!lot) return;
    setError(null);
    try {
      const result = await sendOtp.mutateAsync({ lotId: lot.id });
      setOtpSent(true);
      setMaskedMobile(result.maskedMobile);
      setDevOtp(result.devOtp ?? null);
      setCooldownRemaining(result.cooldownSeconds || OTP_RESEND_COOLDOWN_SECONDS);
      toast.success('OTP sent', {
        description: `Sent to ${result.maskedMobile}`,
      });
    } catch (err) {
      const message = getLotReceiptErrorMessage(err, 'Failed to send OTP');
      setError(message);
      toast.error('Failed to send OTP', { description: message });
    }
  }

  async function handleConfirm() {
    if (!lot) return;
    setError(null);
    try {
      await confirmReceipt.mutateAsync({
        lotId: lot.id,
        otp,
        dispatchId,
      });
      toast.success('Lot received', {
        description: `${lot.farmerName} — ${lot.bagTotal} bags`,
      });
      onOpenChange(false);
    } catch (err) {
      const message = getLotReceiptErrorMessage(err, 'Could not confirm receipt');
      setError(message);
      toast.error('Could not confirm receipt', { description: message });
    }
  }

  if (!lot) return null;

  const displayMobile = maskedMobile || lot.mobileMasked;
  const canResend = otpSent && cooldownRemaining === 0 && !isSending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive lot</DialogTitle>
          <DialogDescription>
            Confirm receipt with a one-time password sent to the farmer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs">Farmer</dt>
              <dd className="font-medium">{lot.farmerName}</dd>
              <dd className="text-muted-foreground text-xs">Account #{lot.farmerAccountNumber}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Mobile</dt>
              <dd className="font-medium tabular-nums">{displayMobile}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Variety</dt>
              <dd className="font-medium">{lot.varietyName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Seed bags</dt>
              <dd className="font-medium tabular-nums">{lot.bagTotal}</dd>
            </div>
          </dl>

          {devOtp ? (
            <div className="rounded-md border border-dashed px-3 py-3">
              <p className="text-muted-foreground text-xs">Simulated OTP</p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-lg tracking-widest">{devOtp}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setOtp(devOtp)}>
                  Use this code
                </Button>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                SMS is not sent yet — use this code to complete receipt in local development.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="lot-receipt-otp">OTP</Label>
            <Input
              id="lot-receipt-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              disabled={!otpSent || isConfirming}
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(next);
              }}
            />
          </div>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
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
                disabled={otp.length !== 6 || isConfirming || isSending}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  'Confirm receipt'
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
