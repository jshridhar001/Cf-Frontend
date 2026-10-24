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
import { useDeleteRouging } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-delete-rouging';
import type { Rouging } from '@/features/farmers/farmer-profile/seed-and-fields-tab/rouging-types';

function formatRougingDate(value: string) {
  const date = parseDateOnlyString(value);
  return date ? format(date, 'd MMM yyyy') : value;
}

export function DeleteRougingDialog({
  rouging,
  open,
  onOpenChange,
}: {
  rouging: Rouging | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync: deleteRouging, isPending } = useDeleteRouging();
  const range = rouging
    ? `${formatRougingDate(rouging.startDate)} to ${formatRougingDate(rouging.endDate)}`
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
          <AlertDialogTitle>Delete this rouging?</AlertDialogTitle>
          <AlertDialogDescription>
            {range
              ? `This will permanently delete the rouging from ${range}. This cannot be undone.`
              : 'This will permanently delete this rouging. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !rouging}
            onClick={() => {
              if (!rouging) return;
              void deleteRouging({ id: rouging.id, fieldId: rouging.fieldId })
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
