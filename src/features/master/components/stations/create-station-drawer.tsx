import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { CreateStationForm } from './create-station-form';

interface CreateStationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStationDrawer({ open, onOpenChange }: CreateStationDrawerProps) {
  const isCreating = useIsMutating({ mutationKey: ['master', 'create-station'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Station"
      description="Create a new station. City and state are optional."
      isMutating={isCreating}
    >
      <CreateStationForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </MasterFormDrawer>
  );
}
