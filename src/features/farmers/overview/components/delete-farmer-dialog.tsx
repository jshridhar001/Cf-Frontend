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
import { useDeleteFarmer } from '@/features/farmers/api/use-delete-farmer';
import type { Farmer } from '@/features/farmers/types';

interface DeleteFarmerDialogProps {
  farmer: Farmer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteFarmerDialog({
  farmer,
  open,
  onOpenChange,
  onDeleted,
}: DeleteFarmerDialogProps) {
  const { mutateAsync: deleteFarmer, isPending } = useDeleteFarmer();

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
          <AlertDialogTitle>Delete {farmer?.name ?? 'this farmer'}?</AlertDialogTitle>
          <AlertDialogDescription>
            {farmer
              ? `This will permanently delete ${farmer.name} (${farmer.accountNumber}). This cannot be undone.`
              : 'This will permanently delete this farmer. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !farmer}
            onClick={() => {
              if (!farmer) return;
              void deleteFarmer(farmer.id)
                .then(() => {
                  onOpenChange(false);
                  onDeleted?.();
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
