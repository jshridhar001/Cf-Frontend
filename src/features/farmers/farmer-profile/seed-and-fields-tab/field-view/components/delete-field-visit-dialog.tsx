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
import { useDeleteFieldVisit } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-delete-field-visit';
import type { FieldVisit } from '@/features/farmers/farmer-profile/seed-and-fields-tab/field-visit-types';

function formatVisitDate(value: string) {
  const date = parseDateOnlyString(value);
  return date ? format(date, 'd MMM yyyy') : value;
}

export function DeleteFieldVisitDialog({
  visit,
  open,
  onOpenChange,
}: {
  visit: FieldVisit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync: deleteVisit, isPending } = useDeleteFieldVisit();
  const range = visit
    ? `${formatVisitDate(visit.startDate)} to ${formatVisitDate(visit.endDate)}`
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
          <AlertDialogTitle>Delete this field visit?</AlertDialogTitle>
          <AlertDialogDescription>
            {range
              ? `This will permanently delete the field visit from ${range}. This cannot be undone.`
              : 'This will permanently delete this field visit. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !visit}
            onClick={() => {
              if (!visit) return;
              void deleteVisit({ id: visit.id, fieldId: visit.fieldId })
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
