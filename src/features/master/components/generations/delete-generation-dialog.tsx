import { useDeleteGeneration } from '@/features/master/api/use-delete-generation';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import type { Generation } from '@/features/master/types';

interface DeleteGenerationDialogProps {
  generation: Generation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGenerationDialog({
  generation,
  open,
  onOpenChange,
}: DeleteGenerationDialogProps) {
  const { mutateAsync: deleteGeneration, isPending } = useDeleteGeneration();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${generation?.name ?? 'this generation'}?`}
      description={
        generation
          ? `This will permanently delete ${generation.name}. This cannot be undone.`
          : 'This will permanently delete this generation. This cannot be undone.'
      }
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!generation}
      onConfirm={() => {
        if (!generation) return;
        void deleteGeneration(generation.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
