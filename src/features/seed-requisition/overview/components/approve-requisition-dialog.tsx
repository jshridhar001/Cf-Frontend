import { CheckIcon } from 'lucide-react';
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
import { useReviewSeedRequisition } from '@/features/seed-requisition/overview/api/use-review-seed-requisition';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';

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
  const farmerName = requisition?.farmer?.name ?? 'this farmer';

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
            This marks the requisition as approved. You can still edit quantity later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isPending || !requisition}
            onClick={() => {
              if (!requisition) return;
              void reviewRequisition({ requisitionId: requisition.id, status: 'APPROVED' })
                .then(() => {
                  onOpenChange(false);
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
