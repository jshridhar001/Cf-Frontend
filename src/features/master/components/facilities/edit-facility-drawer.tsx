import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import type { Facility } from '@/features/master/types';
import { EditFacilityForm } from './edit-facility-form';

interface EditFacilityDrawerProps {
  facility: Facility | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFacilityDrawer({ facility, open, onOpenChange }: EditFacilityDrawerProps) {
  const isSaving = useIsMutating({ mutationKey: ['master', 'update-facility'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Facility"
      description="Update this facility's name and where it is used."
      isMutating={isSaving}
    >
      {facility ? (
        <EditFacilityForm
          key={facility.id}
          facility={facility}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
