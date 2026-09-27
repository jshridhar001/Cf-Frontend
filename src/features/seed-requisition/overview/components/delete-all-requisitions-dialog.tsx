import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import { useDeleteAllSeedRequisitions } from '@/features/seed-requisition/overview/api/use-delete-all-seed-requisitions';

interface DeleteAllRequisitionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllRequisitionsDialog({
  open,
  onOpenChange,
  count,
}: DeleteAllRequisitionsDialogProps) {
  const { mutateAsync: deleteAllRequisitions, isPending } = useDeleteAllSeedRequisitions();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all requisitions?"
      description={
        count === 1
          ? 'This permanently removes 1 requisition. This cannot be undone.'
          : `This permanently removes all ${count} requisitions. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllRequisitions()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
