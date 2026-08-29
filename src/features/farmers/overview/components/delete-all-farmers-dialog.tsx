import { useDeleteAllFarmers } from '@/features/farmers/api/use-delete-all-farmers';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllFarmersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllFarmersDialog({ open, onOpenChange, count }: DeleteAllFarmersDialogProps) {
  const { mutateAsync: deleteAllFarmers, isPending } = useDeleteAllFarmers();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all farmers?"
      description={
        count === 1
          ? 'This permanently removes 1 farmer. This cannot be undone.'
          : `This permanently removes all ${count} farmers. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllFarmers()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
