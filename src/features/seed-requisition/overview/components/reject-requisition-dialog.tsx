import { XIcon } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useSeedRequisitionDecision } from '@/features/seed-requisition/overview/api/use-seed-requisition-decision';
import { formatDeliveryQuantity } from '@/features/seed-requisition/overview/lib/requested-deliveries';
import type {
  SeedRequisition,
  SeedRequisitionDelivery,
} from '@/features/seed-requisition/overview/types';
import { formatRequisitionDate } from '@/features/seed-requisition/overview/types';

interface RejectRequisitionDialogProps {
  requisition: SeedRequisition | null;
  delivery: SeedRequisitionDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectRequisitionDialog({
  requisition,
  delivery,
  open,
  onOpenChange,
}: RejectRequisitionDialogProps) {
  const { mutateAsync, isPending } = useSeedRequisitionDecision();
  const [remarks, setRemarks] = useState('');
  const [touched, setTouched] = useState(false);
  const farmerName = requisition?.farmer?.name ?? 'this farmer';
  const quantity = delivery ? formatDeliveryQuantity(delivery) : '';
  const lineLabel = delivery
    ? `${quantity ? `${quantity} on ` : ''}${formatRequisitionDate(delivery.deliveryDate)}`
    : 'this delivery';
  const trimmed = remarks.trim();
  const isInvalid = touched && trimmed.length === 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    if (!nextOpen) {
      setRemarks('');
      setTouched(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <XIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Reject {lineLabel} for {farmerName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This rejects only this delivery. Remarks are required so the reason is recorded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field data-invalid={isInvalid}>
          <FieldLabel htmlFor="rejection-remarks">Rejection remarks</FieldLabel>
          <Textarea
            id="rejection-remarks"
            value={remarks}
            onBlur={() => setTouched(true)}
            onChange={(event) => setRemarks(event.target.value)}
            disabled={isPending}
          />
          {isInvalid ? <FieldError errors={[{ message: 'Enter rejection remarks.' }]} /> : null}
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !requisition || !delivery?.id || trimmed.length === 0}
            onClick={() => {
              if (!requisition || !delivery?.id || trimmed.length === 0) {
                setTouched(true);
                return;
              }
              void mutateAsync({
                requisitionId: requisition.id,
                deliveryId: delivery.id,
                decision: 'REJECTED',
                rejectionRemarks: trimmed,
              })
                .then(() => {
                  handleOpenChange(false);
                })
                .catch(() => undefined);
            }}
          >
            {isPending ? 'Rejecting…' : 'Reject'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
