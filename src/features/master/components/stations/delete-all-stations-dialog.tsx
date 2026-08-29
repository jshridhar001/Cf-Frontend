import { useDeleteAllStations } from '@/features/master/api/use-delete-all-stations';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllStationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllStationsDialog({
  open,
  onOpenChange,
  count,
}: DeleteAllStationsDialogProps) {
  const { mutateAsync: deleteAllStations, isPending } = useDeleteAllStations();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all stations?"
      description={
        count === 1
          ? 'This permanently removes 1 station and its localities. This cannot be undone.'
          : `This permanently removes all ${count} stations and their localities. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllStations()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
