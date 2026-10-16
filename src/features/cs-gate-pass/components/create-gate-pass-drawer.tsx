import { useIsMutating } from '@tanstack/react-query';
import { formatDateOnlyString } from '@/components/ui/date-picker';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { useCreateGatePass } from '../api/use-create-gate-pass';
import { GatePassForm } from './gate-pass-form';

interface CreateGatePassDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGatePassDrawer({ open, onOpenChange }: CreateGatePassDrawerProps) {
  const { mutateAsync: createGatePass, isPending } = useCreateGatePass();
  const isCreating = useIsMutating({ mutationKey: ['cs-gate-pass', 'create'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add gate pass"
      description="Record a cold storage gate pass. This reduces the current quantity for the selected stock."
      isMutating={isCreating}
    >
      <GatePassForm
        formId="create-cs-gate-pass-form"
        defaultValues={{
          facilityId: '',
          gatePassDate: formatDateOnlyString(new Date()),
          varietyId: '',
          generationId: '',
          sizeId: '',
          quantity: '',
        }}
        submitLabel="Create gate pass"
        pendingLabel="Creating…"
        isPending={isPending}
        onCancel={() => onOpenChange(false)}
        onSubmit={async (value) => {
          await createGatePass({
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
    </MasterFormDrawer>
  );
}
