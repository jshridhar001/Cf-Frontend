import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { CreateVarietyForm } from './create-variety-form';

interface CreateVarietyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVarietyDrawer({ open, onOpenChange }: CreateVarietyDrawerProps) {
  const isCreating = useIsMutating({ mutationKey: ['master', 'create-variety'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Variety"
      description="Create a new crop variety. Names must be unique."
      isMutating={isCreating}
    >
      <CreateVarietyForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </MasterFormDrawer>
  );
}
