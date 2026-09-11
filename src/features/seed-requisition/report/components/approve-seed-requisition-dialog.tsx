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
import { dateOnlyToIsoDatetime } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import { approveSeedRequisitionFormSchema } from '@/features/seed-requisition/report/schemas/seed-requisition.schema';
import type { SeedRequisitionRow } from '@/features/seed-requisition/report/types';

type ApproveSeedRequisitionDialogProps = {
  requisition: SeedRequisitionRow | null;
  onOpenChange: (open: boolean) => void;
};

function ApproveSeedRequisitionForm({
  requisition,
  onClose,
}: {
  requisition: SeedRequisitionRow;
  onClose: () => void;
}) {
  const { mutateAsync: reviewSeedRequisition } = useReviewSeedRequisition();

  const form = useForm({
    defaultValues: {
      approvedDeliveryDate: requisition.requestedDeliveryDate,
    },
    validators: {
      onChange: approveSeedRequisitionFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await reviewSeedRequisition({
          requisitionId: requisition.id,
          status: 'APPROVED',
          approvedDeliveryDate: dateOnlyToIsoDatetime(value.approvedDeliveryDate),
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
        id="approve-seed-requisition-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="approvedDeliveryDate">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="seed-req-approved-delivery-date">
                    Approved delivery date
                  </FieldLabel>
                  <Input
                    id="seed-req-approved-delivery-date"
                    type="date"
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
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
              form="approve-seed-requisition-form"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve Requisition'
              )}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </>
  );
}

export function ApproveSeedRequisitionDialog({
  requisition,
  onOpenChange,
}: ApproveSeedRequisitionDialogProps) {
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
          <DialogTitle>Approve Requisition</DialogTitle>
          <DialogDescription>
            Set the approved delivery date for {requisition?.farmer ?? 'this requisition'}.
          </DialogDescription>
        </DialogHeader>
        {requisition ? (
          <ApproveSeedRequisitionForm
            key={requisition.id}
            requisition={requisition}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
