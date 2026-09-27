import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import { useRequisitionSampleStore } from '@/features/seed-requisition/overview/components/requisition-sample-store';

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
  const { deleteAllRequisitions, isSaving: isPending } = useRequisitionSampleStore();

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
