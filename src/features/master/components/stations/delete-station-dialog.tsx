import { useDeleteStation } from '@/features/master/api/use-delete-station';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import type { Station } from '@/features/master/types';

interface DeleteStationDialogProps {
  station: Station | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteStationDialog({ station, open, onOpenChange }: DeleteStationDialogProps) {
  const { mutateAsync: deleteStation, isPending } = useDeleteStation();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${station?.name ?? 'this station'}?`}
      description={
        station
          ? `This will permanently delete ${station.name} and all its localities. This cannot be undone.`
          : 'This will permanently delete this station. This cannot be undone.'
      }
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!station}
      onConfirm={() => {
        if (!station) return;
        void deleteStation(station.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
