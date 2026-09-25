import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import type { NamedMaster } from '@/features/master/types';
import { EditNamedMasterForm } from './edit-named-master-form';

interface EditNamedMasterDrawerProps {
  resourceId: AddressMasterId;
  item: NamedMaster | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNamedMasterDrawer({
  resourceId,
  item,
  open,
  onOpenChange,
}: EditNamedMasterDrawerProps) {
  const resource = getAddressMaster(resourceId);
  const isSaving =
    useIsMutating({ mutationKey: ['master', 'update-named-master', resourceId] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit ${resource.singularTitle}`}
      description={`Update this ${resource.singular}'s name.`}
      isMutating={isSaving}
    >
      {item ? (
        <EditNamedMasterForm
          key={item.id}
          resourceId={resourceId}
          item={item}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
