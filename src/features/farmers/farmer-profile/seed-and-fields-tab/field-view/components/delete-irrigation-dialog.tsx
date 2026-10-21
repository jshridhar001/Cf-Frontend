import { Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteIrrigation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-delete-irrigation';
import type { Irrigation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/irrigation-types';

export function DeleteIrrigationDialog({
  irrigation,
  open,
  onOpenChange,
}: {
  irrigation: Irrigation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync: deleteIrrigation, isPending } = useDeleteIrrigation();
  const cycle = irrigation?.cycleNumber;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isPending) return;
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this irrigation?</AlertDialogTitle>
          <AlertDialogDescription>
            {cycle
              ? `This will permanently delete cycle ${cycle}. This cannot be undone.`
              : 'This will permanently delete this irrigation. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !irrigation}
            onClick={() => {
              if (!irrigation) return;
              void deleteIrrigation({ id: irrigation.id, fieldId: irrigation.fieldId })
                .then(() => onOpenChange(false))
                .catch(() => undefined);
            }}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
