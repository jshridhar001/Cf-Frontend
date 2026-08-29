import { useDeleteAllTuberSizes } from '@/features/master/api/use-delete-all-tuber-sizes';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllTuberSizesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllTuberSizesDialog({
  open,
  onOpenChange,
  count,
}: DeleteAllTuberSizesDialogProps) {
  const { mutateAsync: deleteAllTuberSizes, isPending } = useDeleteAllTuberSizes();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all tuber sizes?"
      description={
        count === 1
          ? 'This will permanently delete 1 tuber size. This cannot be undone.'
          : `This will permanently delete ${count} tuber sizes. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllTuberSizes()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
