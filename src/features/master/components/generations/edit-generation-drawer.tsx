import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import type { Generation } from '@/features/master/types';
import { EditGenerationForm } from './edit-generation-form';

interface EditGenerationDrawerProps {
  generation: Generation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGenerationDrawer({
  generation,
  open,
  onOpenChange,
}: EditGenerationDrawerProps) {
  const isSaving = useIsMutating({ mutationKey: ['master', 'update-generation'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Generation"
      description="Update this generation's name."
      isMutating={isSaving}
    >
      {generation ? (
        <EditGenerationForm
          key={generation.id}
          generation={generation}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
