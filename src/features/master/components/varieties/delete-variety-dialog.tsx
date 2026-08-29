import { useDeleteVariety } from '@/features/master/api/use-delete-variety';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import type { Variety } from '@/features/master/types';

interface DeleteVarietyDialogProps {
  variety: Variety | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVarietyDialog({ variety, open, onOpenChange }: DeleteVarietyDialogProps) {
  const { mutateAsync: deleteVariety, isPending } = useDeleteVariety();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${variety?.name ?? 'this variety'}?`}
      description={
        variety
          ? `This will permanently delete ${variety.name}. This cannot be undone.`
          : 'This will permanently delete this variety. This cannot be undone.'
      }
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!variety}
      onConfirm={() => {
        if (!variety) return;
        void deleteVariety(variety.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
