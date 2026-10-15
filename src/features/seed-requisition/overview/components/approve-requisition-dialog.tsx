import { CheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { Field, FieldLabel } from '@/components/ui/field';
import { useSeedRequisitionDecision } from '@/features/seed-requisition/overview/api/use-seed-requisition-decision';
import { DateFilterButton } from '@/features/seed-requisition/overview/components/date-filter-button';
import { formatDeliveryQuantity } from '@/features/seed-requisition/overview/lib/requested-deliveries';
import type {
  SeedRequisition,
  SeedRequisitionDelivery,
} from '@/features/seed-requisition/overview/types';
import {
  formatRequisitionDate,
  toDateInputValue,
  toRequisitionDateParam,
} from '@/features/seed-requisition/overview/types';

interface ApproveRequisitionDialogProps {
  requisition: SeedRequisition | null;
  delivery: SeedRequisitionDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveRequisitionDialog({
  requisition,
  delivery,
  open,
  onOpenChange,
}: ApproveRequisitionDialogProps) {
  const { mutateAsync, isPending } = useSeedRequisitionDecision();
  const [deliveryDate, setDeliveryDate] = useState('');
  const farmerName = requisition?.farmer?.name ?? 'this farmer';
  const quantity = delivery ? formatDeliveryQuantity(delivery) : '';
  const lineLabel = delivery
    ? `${quantity ? `${quantity} on ` : ''}${formatRequisitionDate(delivery.deliveryDate)}`
    : 'this delivery';

  useEffect(() => {
    if (open && delivery) {
      setDeliveryDate(toDateInputValue(delivery.deliveryDate));
    }
    if (!open) setDeliveryDate('');
  }, [open, delivery]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-primary/10 text-primary">
            <CheckIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Approve {lineLabel} for {farmerName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This approves only this delivery. You can change its date before confirming.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="approved-delivery-date">Delivery date</FieldLabel>
          <DateFilterButton
            id="approved-delivery-date"
            value={deliveryDate || undefined}
            onChange={(next) => setDeliveryDate(next ?? '')}
            placeholder="Pick a date"
            clearable={false}
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending || !requisition || !delivery?.id || deliveryDate.length === 0}
            onClick={() => {
              if (!requisition || !delivery?.id || deliveryDate.length === 0) return;
              void mutateAsync({
                requisitionId: requisition.id,
                deliveryId: delivery.id,
                decision: 'APPROVED',
                deliveryDate: toRequisitionDateParam(deliveryDate),
              })
                .then(() => {
                  handleOpenChange(false);
                })
                .catch(() => undefined);
            }}
          >
            {isPending ? 'Approving…' : 'Approve'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
