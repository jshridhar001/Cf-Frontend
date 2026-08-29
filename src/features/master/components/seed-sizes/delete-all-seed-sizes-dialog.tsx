import { useDeleteAllSeedSizes } from '@/features/master/api/use-delete-all-seed-sizes';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllSeedSizesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllSeedSizesDialog({
  open,
  onOpenChange,
  count,
}: DeleteAllSeedSizesDialogProps) {
  const { mutateAsync: deleteAllSeedSizes, isPending } = useDeleteAllSeedSizes();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all seed sizes?"
      description={
        count === 1
          ? 'This will permanently delete 1 seed size. This cannot be undone.'
          : `This will permanently delete ${count} seed sizes. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllSeedSizes()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
