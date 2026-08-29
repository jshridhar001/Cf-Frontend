import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { CreateTuberSizeForm } from './create-tuber-size-form';

interface CreateTuberSizeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTuberSizeDrawer({ open, onOpenChange }: CreateTuberSizeDrawerProps) {
  const isCreating = useIsMutating({ mutationKey: ['master', 'create-tuber-size'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Tuber Size"
      description="Create a new tuber size. Names must be unique."
      isMutating={isCreating}
    >
      <CreateTuberSizeForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </MasterFormDrawer>
  );
}
