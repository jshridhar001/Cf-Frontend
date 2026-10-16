import { useIsMutating } from '@tanstack/react-query';
import { formatDateOnlyString } from '@/components/ui/date-picker';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { useUpdateGatePass } from '../api/use-update-gate-pass';
import type { ColdStorageGatePass } from '../types';
import { GatePassForm } from './gate-pass-form';

interface EditGatePassDrawerProps {
  gatePass: ColdStorageGatePass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatDateOnlyString(date);
}

export function EditGatePassDrawer({ gatePass, open, onOpenChange }: EditGatePassDrawerProps) {
  const { mutateAsync: updateGatePass, isPending } = useUpdateGatePass();
  const isSaving = useIsMutating({ mutationKey: ['cs-gate-pass', 'update'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit gate pass"
      description="Changing the quantity or stock details updates the current quantity in cold storage."
      isMutating={isSaving}
    >
      {gatePass ? (
        <GatePassForm
          key={gatePass.id}
          formId="edit-cs-gate-pass-form"
          defaultValues={{
            facilityId: gatePass.facilityId,
            gatePassDate: toDateInputValue(gatePass.gatePassDate),
            varietyId: gatePass.varietyId,
            generationId: gatePass.generationId,
            sizeId: gatePass.sizeId,
            quantity: String(gatePass.quantity),
          }}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          isPending={isPending}
          onCancel={() => onOpenChange(false)}
          onSubmit={async (value) => {
            await updateGatePass({
              id: gatePass.id,
              facilityId: value.facilityId,
              gatePassDate: value.gatePassDate,
              varietyId: value.varietyId,
              generationId: value.generationId,
              sizeId: value.sizeId,
              quantity: Number(value.quantity),
            });
            onOpenChange(false);
          }}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
