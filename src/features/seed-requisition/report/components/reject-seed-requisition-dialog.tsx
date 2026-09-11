import { useForm } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useReviewSeedRequisition } from '@/features/seed-requisition/report/api/use-review-seed-requisition';
import { rejectSeedRequisitionFormSchema } from '@/features/seed-requisition/report/schemas/seed-requisition.schema';
import type { SeedRequisitionRow } from '@/features/seed-requisition/report/types';

type RejectSeedRequisitionDialogProps = {
  requisition: SeedRequisitionRow | null;
  onOpenChange: (open: boolean) => void;
};

function RejectSeedRequisitionForm({
  requisition,
  onClose,
}: {
  requisition: SeedRequisitionRow;
  onClose: () => void;
}) {
  const { mutateAsync: reviewSeedRequisition } = useReviewSeedRequisition();

  const form = useForm({
    defaultValues: {
      rejectionRemarks: '',
    },
    validators: {
      onChange: rejectSeedRequisitionFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await reviewSeedRequisition({
          requisitionId: requisition.id,
          status: 'REJECTED',
          rejectionRemarks: value.rejectionRemarks.trim(),
        });
        onClose();
      } catch {
        // Error toast is handled by the mutation.
      }
    },
  });

  return (
    <>
      <form
        id="reject-seed-requisition-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="rejectionRemarks">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="seed-req-reject-remarks">Rejection remarks</FieldLabel>
                  <Input
                    id="seed-req-reject-remarks"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Reason for rejection"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              form="reject-seed-requisition-form"
              variant="destructive"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Requisition'
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </>
  );
}

export function RejectSeedRequisitionDialog({
  requisition,
  onOpenChange,
}: RejectSeedRequisitionDialogProps) {
  const open = requisition != null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Requisition</DialogTitle>
          <DialogDescription>
            Reject the requisition for {requisition?.farmer ?? 'this farmer'}. This cannot be undone
            from the overview.
          </DialogDescription>
        </DialogHeader>
        {requisition ? (
          <RejectSeedRequisitionForm
            key={requisition.id}
            requisition={requisition}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
