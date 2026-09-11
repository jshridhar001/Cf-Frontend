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
import { useReviewSeedRequisition } from '@/features/seed-requisition/overview/api/use-review-seed-requisition';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';

interface RejectRequisitionDialogProps {
  requisition: SeedRequisition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectRequisitionDialog({
  requisition,
  open,
  onOpenChange,
}: RejectRequisitionDialogProps) {
  const { mutateAsync: reviewRequisition, isPending } = useReviewSeedRequisition();
  const [remarks, setRemarks] = useState('');
  const [touched, setTouched] = useState(false);
  const farmerName = requisition?.farmer?.name ?? 'this farmer';
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
          <AlertDialogTitle>Reject requisition for {farmerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Rejection remarks are required so the farmer knows why this request was declined.
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
            disabled={isPending || !requisition || trimmed.length === 0}
            onClick={() => {
              if (!requisition || trimmed.length === 0) {
                setTouched(true);
                return;
              }
              void reviewRequisition({
                requisitionId: requisition.id,
                status: 'REJECTED',
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
