import { useDeleteLocality } from '@/features/master/api/use-delete-locality';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import type { Locality } from '@/features/master/types';

interface DeleteLocalityDialogProps {
  locality: Locality | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLocalityDialog({ locality, open, onOpenChange }: DeleteLocalityDialogProps) {
  const { mutateAsync: deleteLocality, isPending } = useDeleteLocality();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${locality?.name ?? 'this locality'}?`}
      description={
        locality
          ? `This will permanently delete ${locality.name}. This cannot be undone.`
          : 'This will permanently delete this locality. This cannot be undone.'
      }
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!locality}
      onConfirm={() => {
        if (!locality) return;
        void deleteLocality(locality.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
