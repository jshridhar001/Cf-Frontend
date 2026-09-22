import { useDeleteAddress } from '@/features/master/api/use-addresses';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import { ADDRESS_LEVEL_CONFIG, type AddressLevel } from '@/features/master/lib/address-levels';
import type { AddressEntity } from '@/features/master/types/addresses';

interface DeleteAddressDialogProps {
  level: AddressLevel;
  entity: AddressEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAddressDialog({
  level,
  entity,
  open,
  onOpenChange,
}: DeleteAddressDialogProps) {
  const config = ADDRESS_LEVEL_CONFIG[level];
  const { mutateAsync: deleteAddress, isPending } = useDeleteAddress(level);
  const name = entity?.name ?? `this ${config.singular.toLowerCase()}`;
  const cascadeWarning = config.descendants
    ? ` This will also delete all ${config.descendants} under it.`
    : '';

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${name}?`}
      description={`This will permanently delete ${name}.${cascadeWarning} This cannot be undone.`}
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!entity}
      onConfirm={() => {
        if (!entity) return;
        void deleteAddress(entity.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
