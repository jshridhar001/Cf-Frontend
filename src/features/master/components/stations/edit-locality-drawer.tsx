import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import type { Locality } from '@/features/master/types';
import { EditLocalityForm } from './edit-locality-form';

interface EditLocalityDrawerProps {
  locality: Locality | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLocalityDrawer({ locality, open, onOpenChange }: EditLocalityDrawerProps) {
  const isSaving = useIsMutating({ mutationKey: ['master', 'update-locality'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Locality"
      description="Update this locality's name."
      isMutating={isSaving}
    >
      {locality ? (
        <EditLocalityForm
          key={locality.id}
          locality={locality}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
