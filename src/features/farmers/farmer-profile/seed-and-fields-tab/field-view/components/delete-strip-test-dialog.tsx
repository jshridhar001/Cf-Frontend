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
import { useDeleteStripTestGroup } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-delete-strip-test-group';
import type { StripTestGroup } from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';

export function DeleteStripTestDialog({
  group,
  open,
  onOpenChange,
}: {
  group: StripTestGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync: deleteGroup, isPending } = useDeleteStripTestGroup();

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
          <AlertDialogTitle>Delete this strip test?</AlertDialogTitle>
          <AlertDialogDescription>
            {group
              ? `This will permanently delete ${group.name}, including its strips and tuber records. This cannot be undone.`
              : 'This will permanently delete this strip test, including its strips and tuber records. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !group}
            onClick={() => {
              if (!group) return;
              void deleteGroup({ id: group.id, fieldId: group.fieldId })
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
