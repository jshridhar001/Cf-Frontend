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
import { useDeleteField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-delete-field';
import type { FarmerField } from '@/features/farmers/farmer-profile/seed-and-fields-tab/types';

export function DeleteFieldDialog({
  field,
  open,
  onOpenChange,
  onDeleted,
}: {
  field: FarmerField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const { mutateAsync: deleteField, isPending } = useDeleteField();

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
          <AlertDialogTitle>Delete {field?.name ?? 'this field'}?</AlertDialogTitle>
          <AlertDialogDescription>
            {field
              ? `This will permanently delete ${field.name}. This cannot be undone.`
              : 'This will permanently delete this field. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !field}
            onClick={() => {
              if (!field) return;
              void deleteField(field.id)
                .then(() => {
                  onOpenChange(false);
                  onDeleted?.();
                })
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
