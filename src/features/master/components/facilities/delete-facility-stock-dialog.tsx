import { useDeleteFacilityStock } from '@/features/master/api/use-delete-facility-stock';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';
import type { FacilityStockTableRow } from './facility-stock-table-column';

interface DeleteFacilityStockDialogProps {
  stock: FacilityStockTableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteFacilityStockDialog({
  stock,
  open,
  onOpenChange,
}: DeleteFacilityStockDialogProps) {
  const { mutateAsync: deleteFacilityStock, isPending } = useDeleteFacilityStock();
  const label = stock?.varietyName ?? 'this stock row';

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${label}?`}
      description={
        stock
          ? `This will permanently delete ${stock.varietyName} (${stock.sizeName}, ${stock.generationName}). This cannot be undone.`
          : 'This will permanently delete this stock row. This cannot be undone.'
      }
      isPending={isPending}
      confirmLabel="Delete"
      confirmDisabled={!stock}
      onConfirm={() => {
        if (!stock) return;
        void deleteFacilityStock(stock.id)
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
