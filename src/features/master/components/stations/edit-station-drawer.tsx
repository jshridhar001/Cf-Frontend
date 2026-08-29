import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import type { Station } from '@/features/master/types';
import { EditStationForm } from './edit-station-form';

interface EditStationDrawerProps {
  station: Station | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStationDrawer({ station, open, onOpenChange }: EditStationDrawerProps) {
  const isSaving = useIsMutating({ mutationKey: ['master', 'update-station'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Station"
      description="Update this station's details."
      isMutating={isSaving}
    >
      {station ? (
        <EditStationForm
          key={station.id}
          station={station}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
