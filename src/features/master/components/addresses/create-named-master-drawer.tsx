import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { type AddressMasterId, getAddressMaster } from '@/features/master/lib/address-masters';
import { CreateNamedMasterForm } from './create-named-master-form';

interface CreateNamedMasterDrawerProps {
  resourceId: AddressMasterId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNamedMasterDrawer({
  resourceId,
  open,
  onOpenChange,
}: CreateNamedMasterDrawerProps) {
  const resource = getAddressMaster(resourceId);
  const isCreating =
    useIsMutating({ mutationKey: ['master', 'create-named-master', resourceId] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Add ${resource.singularTitle}`}
      description={`Create a new ${resource.singular}. Names must be unique.`}
      isMutating={isCreating}
    >
      <CreateNamedMasterForm
        resourceId={resourceId}
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </MasterFormDrawer>
  );
}
