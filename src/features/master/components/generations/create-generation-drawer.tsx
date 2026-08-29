import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { CreateGenerationForm } from './create-generation-form';

interface CreateGenerationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGenerationDrawer({ open, onOpenChange }: CreateGenerationDrawerProps) {
  const isCreating = useIsMutating({ mutationKey: ['master', 'create-generation'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Generation"
      description="Create a new seed generation. Names must be unique."
      isMutating={isCreating}
    >
      <CreateGenerationForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </MasterFormDrawer>
  );
}
