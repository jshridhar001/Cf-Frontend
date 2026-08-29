import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import type { TuberSize } from '@/features/master/types';
import { EditTuberSizeForm } from './edit-tuber-size-form';

interface EditTuberSizeDrawerProps {
  tuberSize: TuberSize | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTuberSizeDrawer({ tuberSize, open, onOpenChange }: EditTuberSizeDrawerProps) {
  const isSaving = useIsMutating({ mutationKey: ['master', 'update-tuber-size'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Tuber Size"
      description="Update this tuber size's name."
      isMutating={isSaving}
    >
      {tuberSize ? (
        <EditTuberSizeForm
          key={tuberSize.id}
          tuberSize={tuberSize}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
