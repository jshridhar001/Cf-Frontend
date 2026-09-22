import { useDeleteAllAddresses } from '@/features/master/api/use-addresses';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import { ADDRESS_LEVEL_CONFIG, type AddressLevel } from '@/features/master/lib/address-levels';

interface DeleteAllAddressesDialogProps {
  level: AddressLevel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllAddressesDialog({
  level,
  open,
  onOpenChange,
  count,
}: DeleteAllAddressesDialogProps) {
  const config = ADDRESS_LEVEL_CONFIG[level];
  const { mutateAsync: deleteAllAddresses, isPending } = useDeleteAllAddresses(level);
  const cascadeWarning = config.descendants
    ? ` This will also delete all ${config.descendants} under them.`
    : '';
  const noun = count === 1 ? config.singular.toLowerCase() : config.label.toLowerCase();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete all ${config.label.toLowerCase()}?`}
      description={`This will permanently delete ${count} ${noun}.${cascadeWarning} This cannot be undone.`}
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllAddresses()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
