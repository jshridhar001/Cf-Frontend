import { Trash2Icon } from 'lucide-react';
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
import { useDeleteSeedRequisition } from '@/features/seed-requisition/overview/api/use-delete-seed-requisition';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';

interface DeleteRequisitionDialogProps {
  requisition: SeedRequisition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRequisitionDialog({
  requisition,
  open,
  onOpenChange,
}: DeleteRequisitionDialogProps) {
  const { mutateAsync: deleteRequisition, isPending } = useDeleteSeedRequisition();
  const farmerName = requisition?.farmer?.name ?? 'this farmer';

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete requisition for {farmerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this seed requisition. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !requisition}
            onClick={() => {
              if (!requisition) return;
              void deleteRequisition(requisition.id)
                .then(() => {
                  onOpenChange(false);
                })
                .catch(() => undefined);
            }}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
