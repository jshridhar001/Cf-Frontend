import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { CreateSeedSizeForm } from './create-seed-size-form';

interface CreateSeedSizeDrawerProps {
  varietyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSeedSizeDrawer({ varietyId, open, onOpenChange }: CreateSeedSizeDrawerProps) {
  const isCreating = useIsMutating({ mutationKey: ['master', 'create-seed-size'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Seed Size"
      description="Create a new seed size classification. Names must be unique."
      isMutating={isCreating}
    >
      <CreateSeedSizeForm
        varietyId={varietyId}
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </MasterFormDrawer>
  );
}
