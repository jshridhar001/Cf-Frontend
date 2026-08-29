import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { CreateLocalityForm } from './create-locality-form';

interface CreateLocalityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stationId: string | null;
  stationName?: string;
}

export function CreateLocalityDrawer({
  open,
  onOpenChange,
  stationId,
  stationName,
}: CreateLocalityDrawerProps) {
  const isCreating = useIsMutating({ mutationKey: ['master', 'create-locality'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Locality"
      description={
        stationName ? `Create a new locality in ${stationName}.` : 'Create a new locality.'
      }
      isMutating={isCreating}
    >
      {stationId ? (
        <CreateLocalityForm
          key={stationId}
          stationId={stationId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
