import { useDeleteSeedSizes } from '@/features/master/api/use-delete-seed-sizes';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllSeedSizesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seedSizeIds: string[];
  varietyName: string;
}

export function DeleteAllSeedSizesDialog({
  open,
  onOpenChange,
  seedSizeIds,
  varietyName,
}: DeleteAllSeedSizesDialogProps) {
  const { mutateAsync: deleteSeedSizes, isPending } = useDeleteSeedSizes();
  const count = seedSizeIds.length;

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete all seed sizes for ${varietyName}?`}
      description={
        count === 1
          ? `This will permanently delete 1 seed size for ${varietyName}. This cannot be undone.`
          : `This will permanently delete ${count} seed sizes for ${varietyName}. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteSeedSizes(seedSizeIds)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
