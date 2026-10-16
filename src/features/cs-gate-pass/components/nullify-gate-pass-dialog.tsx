import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import { useNullifyGatePass } from '../api/use-nullify-gate-pass';
import type { ColdStorageGatePass } from '../types';

interface NullifyGatePassDialogProps {
  gatePass: ColdStorageGatePass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NullifyGatePassDialog({
  gatePass,
  open,
  onOpenChange,
}: NullifyGatePassDialogProps) {
  const { mutateAsync: nullifyGatePass, isPending } = useNullifyGatePass();
  const label = gatePass?.facility.name ?? 'this gate pass';

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Mark ${label} as null?`}
      description={
        gatePass
          ? `This puts ${gatePass.quantity} back into current stock for ${gatePass.facility.name}. The gate pass stays visible. This cannot be undone.`
          : 'This restores the quantity to current stock. The gate pass stays visible. This cannot be undone.'
      }
      isPending={isPending}
      confirmLabel="Mark as null"
      pendingLabel="Marking…"
      confirmDisabled={!gatePass}
      onConfirm={() => {
        if (!gatePass) return;
        void nullifyGatePass(gatePass.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
