import { useDeleteAllVarieties } from '@/features/master/api/use-delete-all-varieties';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllVarietiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllVarietiesDialog({
  open,
  onOpenChange,
  count,
}: DeleteAllVarietiesDialogProps) {
  const { mutateAsync: deleteAllVarieties, isPending } = useDeleteAllVarieties();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all varieties?"
      description={
        count === 1
          ? 'This will permanently delete 1 variety. This cannot be undone.'
          : `This will permanently delete ${count} varieties. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllVarieties()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
