import { useDeleteAllGenerations } from '@/features/master/api/use-delete-all-generations';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllGenerationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllGenerationsDialog({
  open,
  onOpenChange,
  count,
}: DeleteAllGenerationsDialogProps) {
  const { mutateAsync: deleteAllGenerations, isPending } = useDeleteAllGenerations();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all generations?"
      description={
        count === 1
          ? 'This will permanently delete 1 generation. This cannot be undone.'
          : `This will permanently delete ${count} generations. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllGenerations()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
