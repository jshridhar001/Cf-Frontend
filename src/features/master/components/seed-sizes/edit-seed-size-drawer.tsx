import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import type { SeedSize } from '@/features/master/types';
import { EditSeedSizeForm } from './edit-seed-size-form';

interface EditSeedSizeDrawerProps {
  seedSize: SeedSize | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSeedSizeDrawer({ seedSize, open, onOpenChange }: EditSeedSizeDrawerProps) {
  const isSaving = useIsMutating({ mutationKey: ['master', 'update-seed-size'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Seed Size"
      description="Update this seed size's name and bags per acre."
      isMutating={isSaving}
    >
      {seedSize ? (
        <EditSeedSizeForm
          key={seedSize.id}
          seedSize={seedSize}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
