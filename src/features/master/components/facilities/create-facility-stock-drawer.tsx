import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { CreateFacilityStockForm } from './create-facility-stock-form';

interface CreateFacilityStockDrawerProps {
  facilityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFacilityStockDrawer({
  facilityId,
  open,
  onOpenChange,
}: CreateFacilityStockDrawerProps) {
  const isCreating = useIsMutating({ mutationKey: ['master', 'create-facility-stock'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add Stock"
      description="Add variety, generation, seed size, and quantity for this facility."
      isMutating={isCreating}
    >
      <CreateFacilityStockForm
        facilityId={facilityId}
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </MasterFormDrawer>
  );
}
