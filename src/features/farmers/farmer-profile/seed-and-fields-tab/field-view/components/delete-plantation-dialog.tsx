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
import { useDeletePlantation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-delete-plantation';
import type { Plantation } from '@/features/farmers/farmer-profile/seed-and-fields-tab/plantation-types';

export function DeletePlantationDialog({
  plantation,
  open,
  onOpenChange,
}: {
  plantation: Plantation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync: deletePlantation, isPending } = useDeletePlantation();
  const variety = plantation?.variety.name;

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
          <AlertDialogTitle>Delete this plantation?</AlertDialogTitle>
          <AlertDialogDescription>
            {variety
              ? `This will permanently delete the ${variety} planting. This cannot be undone.`
              : 'This will permanently delete this planting. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !plantation}
            onClick={() => {
              if (!plantation) return;
              void deletePlantation({ id: plantation.id, fieldId: plantation.fieldId })
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
