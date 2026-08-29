import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { CreateFacilityForm } from './create-facility-form';

interface CreateFacilityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFacilityDrawer({ open, onOpenChange }: CreateFacilityDrawerProps) {
  const isCreating = useIsMutating({ mutationKey: ['master', 'create-facility'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Facility"
      description="Create a new facility and choose where it is used."
      isMutating={isCreating}
    >
      <CreateFacilityForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </MasterFormDrawer>
  );
}
