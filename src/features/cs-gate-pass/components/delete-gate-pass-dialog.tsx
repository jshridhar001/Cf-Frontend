import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import { useDeleteGatePass } from '../api/use-delete-gate-pass';
import type { ColdStorageGatePass } from '../types';

interface DeleteGatePassDialogProps {
  gatePass: ColdStorageGatePass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGatePassDialog({ gatePass, open, onOpenChange }: DeleteGatePassDialogProps) {
  const { mutateAsync: deleteGatePass, isPending } = useDeleteGatePass();
  const label = gatePass?.facility.name ?? 'this gate pass';

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${label}?`}
      description={
        gatePass?.status === 'NULL'
          ? `This permanently deletes the nullified gate pass for ${gatePass.facility.name}. Its quantity was already restored.`
          : gatePass
            ? `This deletes the gate pass and puts ${gatePass.quantity} back into current stock for ${gatePass.facility.name}.`
            : 'This deletes the gate pass and restores its quantity to current stock.'
      }
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!gatePass}
      onConfirm={() => {
        if (!gatePass) return;
        void deleteGatePass(gatePass.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
