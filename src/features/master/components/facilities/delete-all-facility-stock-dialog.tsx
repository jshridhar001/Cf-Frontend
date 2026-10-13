import { useDeleteAllFacilityStock } from '@/features/master/api/use-delete-all-facility-stock';
import { MasterConfirmDialog } from '@/features/master/components/master-confirm-dialog';

interface DeleteAllFacilityStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function DeleteAllFacilityStockDialog({
  open,
  onOpenChange,
  count,
}: DeleteAllFacilityStockDialogProps) {
  const { mutateAsync: deleteAllFacilityStock, isPending } = useDeleteAllFacilityStock();

  return (
    <MasterConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete all facility stock?"
      description="This permanently deletes every facility stock row, including stock at other facilities. This cannot be undone."
      isPending={isPending}
      confirmLabel="Delete all"
      confirmDisabled={count === 0}
      onConfirm={() => {
        void deleteAllFacilityStock()
          .then(() => {
            onOpenChange(false);
          })
          .catch(() => undefined);
      }}
    />
  );
}
