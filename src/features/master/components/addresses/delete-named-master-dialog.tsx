import { useDeleteNamedMaster } from '@/features/master/api/use-delete-named-master';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import type { NamedMaster } from '@/features/master/types';

interface DeleteNamedMasterDialogProps {
  resourceId: AddressMasterId;
  item: NamedMaster | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteNamedMasterDialog({
  resourceId,
  item,
  open,
  onOpenChange,
}: DeleteNamedMasterDialogProps) {
  const resource = getAddressMaster(resourceId);
  const { mutateAsync: deleteNamedMaster, isPending } = useDeleteNamedMaster(resourceId);

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${item?.name ?? `this ${resource.singular}`}?`}
      description={
        item
          ? `This will permanently delete ${item.name}. This cannot be undone.`
          : `This will permanently delete this ${resource.singular}. This cannot be undone.`
      }
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!item}
      onConfirm={() => {
        if (!item) return;
        void deleteNamedMaster(item.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
