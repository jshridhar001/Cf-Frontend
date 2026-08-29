import { useDeleteFacility } from '@/features/master/api/use-delete-facility';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import type { Facility } from '@/features/master/types';

interface DeleteFacilityDialogProps {
  facility: Facility | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteFacilityDialog({ facility, open, onOpenChange }: DeleteFacilityDialogProps) {
  const { mutateAsync: deleteFacility, isPending } = useDeleteFacility();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${facility?.name ?? 'this facility'}?`}
      description={
        facility
          ? `This will permanently delete ${facility.name}. This cannot be undone.`
          : 'This will permanently delete this facility. This cannot be undone.'
      }
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!facility}
      onConfirm={() => {
        if (!facility) return;
        void deleteFacility(facility.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
