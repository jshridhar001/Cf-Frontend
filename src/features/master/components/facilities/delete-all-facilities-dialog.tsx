import { useDeleteAllFacilities } from '@/features/master/api/use-delete-all-facilities';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllFacilitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllFacilitiesDialog({
  open,
  onOpenChange,
  count,
}: DeleteAllFacilitiesDialogProps) {
  const { mutateAsync: deleteAllFacilities, isPending } = useDeleteAllFacilities();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all facilities?"
      description={
        count === 1
          ? 'This will permanently delete 1 facility. This cannot be undone.'
          : `This will permanently delete ${count} facilities. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllFacilities()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
