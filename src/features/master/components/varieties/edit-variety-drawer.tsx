import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import type { Variety } from '@/features/master/types';
import { EditVarietyForm } from './edit-variety-form';

interface EditVarietyDrawerProps {
  variety: Variety | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVarietyDrawer({ variety, open, onOpenChange }: EditVarietyDrawerProps) {
  const isSaving = useIsMutating({ mutationKey: ['master', 'update-variety'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Variety"
      description="Update this variety's name."
      isMutating={isSaving}
    >
      {variety ? (
        <EditVarietyForm
          key={variety.id}
          variety={variety}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
