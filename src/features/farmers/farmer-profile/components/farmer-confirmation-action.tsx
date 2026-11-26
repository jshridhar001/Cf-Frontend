import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFarmerConfirmation } from '@/features/farmers/farmer-profile/api/use-farmer-confirmation';
import { FarmerConfirmationDialog } from '@/features/farmers/farmer-profile/components/farmer-confirmation-dialog';
import { getApiErrorMessage } from '@/lib/api-client';

function formatConfirmedAt(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function FarmerConfirmationAction({
  farmerId,
  farmerName,
}: {
  farmerId: string;
  farmerName: string;
}) {
  const confirmation = useFarmerConfirmation(farmerId);
  const [open, setOpen] = useState(false);
  const status = confirmation.data;

  if (confirmation.isPending) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        Get Confirmation OTP
      </Button>
    );
  }

  if (confirmation.isError) {
    return (
      <p className="max-w-56 text-right text-xs text-destructive">
        {getApiErrorMessage(confirmation.error, "Couldn't load confirmation.")}
      </p>
    );
  }

  if (!status) return null;

  if (status.alreadyConfirmed && status.verifiedAt) {
    return (
      <div className="text-right">
        <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
          Finally confirmed
        </Badge>
        <p className="mt-1 text-xs text-muted-foreground">{formatConfirmedAt(status.verifiedAt)}</p>
      </div>
    );
  }

  const disabled = !status.eligible || !status.configured;
  const notes = [status.reason, status.configured ? null : status.configurationError].filter(
    (note): note is string => Boolean(note),
  );

  return (
    <>
      <div className="flex max-w-56 flex-col items-end gap-1">
        <Button type="button" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
          Get Confirmation OTP
        </Button>
        {status.verifiedAt ? (
          <p className="text-right text-xs text-muted-foreground">
            Last confirmed {formatConfirmedAt(status.verifiedAt)}
          </p>
        ) : null}
        {notes.map((note) => (
          <p key={note} className="text-right text-xs text-muted-foreground">
            {note}
          </p>
        ))}
      </div>
      {status.eligible && status.configured ? (
        <FarmerConfirmationDialog
          farmerId={farmerId}
          farmerName={farmerName}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  );
}
