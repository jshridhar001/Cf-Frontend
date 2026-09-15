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
import { useReviewSeedRequisition } from '@/features/seed-requisition/overview/api/use-review-seed-requisition';
import { DateFilterButton } from '@/features/seed-requisition/overview/components/date-filter-button';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';
import {
  toDateInputValue,
  toRequisitionDateParam,
} from '@/features/seed-requisition/overview/types';

interface ApproveRequisitionDialogProps {
  requisition: SeedRequisition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveRequisitionDialog({
  requisition,
  open,
  onOpenChange,
}: ApproveRequisitionDialogProps) {
  const { mutateAsync: reviewRequisition, isPending } = useReviewSeedRequisition();
  const [approvedDeliveryDate, setApprovedDeliveryDate] = useState('');
  const farmerName = requisition?.farmer?.name ?? 'this farmer';

  useEffect(() => {
    if (open && requisition) {
      setApprovedDeliveryDate(toDateInputValue(requisition.requestedDeliveryDate));
    }
    if (!open) setApprovedDeliveryDate('');
  }, [open, requisition]);

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
          <AlertDialogTitle>Approve requisition for {farmerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Set the approved delivery date. It starts as the requested date; you can change it
            before approving.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="approved-delivery-date">Approved delivery date</FieldLabel>
          <DateFilterButton
            id="approved-delivery-date"
            value={approvedDeliveryDate || undefined}
            onChange={(next) => setApprovedDeliveryDate(next ?? '')}
            placeholder="Pick a date"
            clearable={false}
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending || !requisition || approvedDeliveryDate.length === 0}
            onClick={() => {
              if (!requisition || approvedDeliveryDate.length === 0) return;
              void reviewRequisition({
                requisitionId: requisition.id,
                status: 'APPROVED',
                approvedDeliveryDate: toRequisitionDateParam(approvedDeliveryDate),
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
