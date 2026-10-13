import { useIsMutating } from '@tanstack/react-query';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { EditFacilityStockForm } from './edit-facility-stock-form';
import type { FacilityStockTableRow } from './facility-stock-table-column';

interface EditFacilityStockDrawerProps {
  stock: FacilityStockTableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFacilityStockDrawer({
  stock,
  open,
  onOpenChange,
}: EditFacilityStockDrawerProps) {
  const isSaving = useIsMutating({ mutationKey: ['master', 'update-facility-stock'] }) > 0;

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Stock"
      description="Update the quantity for this stock row."
      isMutating={isSaving}
    >
      {stock ? (
        <EditFacilityStockForm
          key={stock.id}
          stock={stock}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </MasterFormDrawer>
  );
}
