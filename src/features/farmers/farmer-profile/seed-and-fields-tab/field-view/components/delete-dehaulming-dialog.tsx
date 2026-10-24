import { format } from 'date-fns';
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
import { parseDateOnlyString } from '@/components/ui/date-picker';
import { useDeleteDehaulming } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-delete-dehaulming';
import type { Dehaulming } from '@/features/farmers/farmer-profile/seed-and-fields-tab/dehaulming-types';

function formatDehaulmingDate(value: string) {
  const date = parseDateOnlyString(value);
  return date ? format(date, 'd MMM yyyy') : value;
}

export function DeleteDehaulmingDialog({
  dehaulming,
  open,
  onOpenChange,
}: {
  dehaulming: Dehaulming | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync: deleteDehaulming, isPending } = useDeleteDehaulming();
  const range = dehaulming
    ? `${formatDehaulmingDate(dehaulming.startDate)} to ${formatDehaulmingDate(dehaulming.endDate)}`
    : null;

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
          <AlertDialogTitle>Delete this dehaulming?</AlertDialogTitle>
          <AlertDialogDescription>
            {range
              ? `This will permanently delete the dehaulming from ${range}. This cannot be undone.`
              : 'This will permanently delete this dehaulming. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !dehaulming}
            onClick={() => {
              if (!dehaulming) return;
              void deleteDehaulming({ id: dehaulming.id, fieldId: dehaulming.fieldId })
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
