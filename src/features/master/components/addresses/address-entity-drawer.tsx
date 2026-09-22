import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { ADDRESS_LEVEL_CONFIG, type AddressLevel } from '@/features/master/lib/address-levels';
import type { AddressEntity } from '@/features/master/types/addresses';
import { AddressEntityForm } from './address-entity-form';

interface AddressEntityDrawerProps {
  level: AddressLevel;
  entity?: AddressEntity | null;
  initialParentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddressEntityDrawer({
  level,
  entity,
  initialParentId,
  open,
  onOpenChange,
}: AddressEntityDrawerProps) {
  const config = ADDRESS_LEVEL_CONFIG[level];
  const isEdit = Boolean(entity);
  const isMutating =
    useIsMutating({
      mutationKey: ['master', isEdit ? 'update-address' : 'create-address', level],
    }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Edit ${config.singular}` : `Add ${config.singular}`}
      description={
        isEdit
          ? `Update this ${config.singular.toLowerCase()}.`
          : `Create a new ${config.singular.toLowerCase()}. Names must be unique under the same parent.`
      }
      isMutating={isMutating}
    >
      {open ? (
        <AddressEntityForm
          level={level}
          entity={entity}
          initialParentId={isEdit ? undefined : initialParentId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
