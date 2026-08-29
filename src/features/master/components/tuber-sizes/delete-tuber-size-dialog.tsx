import { useDeleteTuberSize } from '@/features/master/api/use-delete-tuber-size';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import type { TuberSize } from '@/features/master/types';
import { formatSeedSize } from '@/lib/format-seed-size';

interface DeleteTuberSizeDialogProps {
  tuberSize: TuberSize | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTuberSizeDialog({
  tuberSize,
  open,
  onOpenChange,
}: DeleteTuberSizeDialogProps) {
  const { mutateAsync: deleteTuberSize, isPending } = useDeleteTuberSize();
  const label = tuberSize ? formatSeedSize(tuberSize.name) : 'this tuber size';

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${label}?`}
      description={`This will permanently delete ${label}. This cannot be undone.`}
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!tuberSize}
      onConfirm={() => {
        if (!tuberSize) return;
        void deleteTuberSize(tuberSize.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
