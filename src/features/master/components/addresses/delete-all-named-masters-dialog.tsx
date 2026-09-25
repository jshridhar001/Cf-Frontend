import { useDeleteAllNamedMasters } from '@/features/master/api/use-delete-all-named-masters';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';

interface DeleteAllNamedMastersDialogProps {
  resourceId: AddressMasterId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllNamedMastersDialog({
  resourceId,
  open,
  onOpenChange,
  count,
}: DeleteAllNamedMastersDialogProps) {
  const resource = getAddressMaster(resourceId);
  const { mutateAsync: deleteAllNamedMasters, isPending } = useDeleteAllNamedMasters(resourceId);
  const noun = count === 1 ? resource.singular : resource.plural;

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete all ${resource.plural}?`}
      description={`This will permanently delete ${count} ${noun}. This cannot be undone.`}
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllNamedMasters()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
