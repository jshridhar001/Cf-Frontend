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
import { useBulkDeleteUsers } from '@/features/access-control/api/use-bulk-delete-users';

interface DeleteAllUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIds: string[];
}

export function DeleteAllUsersDialog({ open, onOpenChange, userIds }: DeleteAllUsersDialogProps) {
  const { mutateAsync: bulkDeleteUsers, isPending } = useBulkDeleteUsers();
  const count = userIds.length;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete all users?</AlertDialogTitle>
          <AlertDialogDescription>
            {count === 1
              ? 'This will permanently delete 1 user. This cannot be undone.'
              : `This will permanently delete ${count} users. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || count === 0}
            onClick={() => {
              void bulkDeleteUsers({ userIds })
                .then(() => {
                  onOpenChange(false);
                })
                .catch(() => undefined);
            }}
          >
            {isPending ? 'Deleting…' : 'Delete all'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
