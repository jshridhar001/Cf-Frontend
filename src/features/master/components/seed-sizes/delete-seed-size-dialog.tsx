import { useDeleteSeedSize } from '@/features/master/api/use-delete-seed-size';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import type { SeedSize } from '@/features/master/types';
import { formatSeedSize } from '@/lib/format-seed-size';

interface DeleteSeedSizeDialogProps {
  seedSize: SeedSize | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSeedSizeDialog({ seedSize, open, onOpenChange }: DeleteSeedSizeDialogProps) {
  const { mutateAsync: deleteSeedSize, isPending } = useDeleteSeedSize();
  const label = seedSize ? formatSeedSize(seedSize.name) : 'this seed size';

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${label}?`}
      description={`This will permanently delete ${label}. This cannot be undone.`}
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!seedSize}
      onConfirm={() => {
        if (!seedSize) return;
        void deleteSeedSize(seedSize.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
