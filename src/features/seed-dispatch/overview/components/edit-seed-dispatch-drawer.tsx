import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import {
  DatePickerInput,
  formatDateOnlyString,
  parseDateOnlyString,
} from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MasterFormDrawer } from '@/features/master/components/master-form-drawer';
import { useUpdateSeedDispatch } from '@/features/seed-dispatch/overview/api/use-update-seed-dispatch';
import {
  type EditSeedDispatchFormValues,
  editSeedDispatchDefaultValues,
  editSeedDispatchSchema,
  toUpdateSeedDispatchBody,
} from '@/features/seed-dispatch/overview/lib/edit-dispatch';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';

type EditSeedDispatchDrawerProps = {
  dispatch: SeedDispatch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function calculatedNetWeight(grossWeight: string, tareWeight: string): number | null {
  const grossText = grossWeight.trim();
  const tareText = tareWeight.trim();
  if (!grossText || !tareText) return null;
  const gross = Number.parseFloat(grossText);
  const tare = Number.parseFloat(tareText);
  if (!Number.isFinite(gross) || !Number.isFinite(tare) || tare > gross) return null;
  return gross - tare;
}

export function EditSeedDispatchDrawer({
  dispatch,
  open,
  onOpenChange,
}: EditSeedDispatchDrawerProps) {
  const updateDispatch = useUpdateSeedDispatch();

  return (
    <MasterFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit dispatch"
      description="Update transport and weighbridge details. Requisitions on this dispatch stay the same."
      isMutating={updateDispatch.isPending}
    >
      <EditSeedDispatchForm
        key={`${dispatch.id}-${dispatch.updatedAt}`}
        dispatch={dispatch}
        isPending={updateDispatch.isPending}
        onCancel={() => onOpenChange(false)}
        onSubmit={async (values) => {
          try {
            await updateDispatch.mutateAsync({
              dispatchId: dispatch.id,
              body: toUpdateSeedDispatchBody(values),
            });
            onOpenChange(false);
          } catch {
            // The mutation shows the error toast.
          }
        }}
      />
    </MasterFormDrawer>
  );
}

function EditSeedDispatchForm({
  dispatch,
  isPending,
  onCancel,
  onSubmit,
}: {
  dispatch: SeedDispatch;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: EditSeedDispatchFormValues) => Promise<void>;
}) {
  const form = useForm({
    defaultValues: editSeedDispatchDefaultValues(dispatch),
    validators: {
      onSubmit: editSeedDispatchSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      id="edit-seed-dispatch-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isPending) return;
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="gap-6">
        <form.Field name="dispatchDate">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <DatePickerInput
                  id="edit-dispatch-date"
                  label="Dispatch date"
                  placeholder="Select date"
                  value={field.state.value ? parseDateOnlyString(field.state.value) : undefined}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  onChange={(date) => {
                    field.handleChange(date ? formatDateOnlyString(date) : '');
                  }}
                  onBlur={field.handleBlur}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="truckNumber">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-dispatch-truck-number">Truck number</FieldLabel>
                <Input
                  id="edit-dispatch-truck-number"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                  aria-invalid={isInvalid}
                  placeholder="e.g. PB08 AB 1234"
                  className="uppercase"
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="toLocation">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-dispatch-to-location">Destination</FieldLabel>
                <Input
                  id="edit-dispatch-to-location"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter destination"
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="manualGatePassNumber">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-dispatch-manual-gate-pass">
                  Manual Gate Pass Number (optional)
                </FieldLabel>
                <Input
                  id="edit-dispatch-manual-gate-pass"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="e.g. 1024"
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="driverMobile">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-dispatch-driver-mobile">
                  Driver mobile number (optional)
                </FieldLabel>
                <Input
                  id="edit-dispatch-driver-mobile"
                  name={field.name}
                  inputMode="tel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="10-digit mobile number"
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="weightSlipNumber">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-dispatch-weight-slip-number">
                  Weight Slip Number (optional)
                </FieldLabel>
                <Input
                  id="edit-dispatch-weight-slip-number"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="e.g. 1024"
                  autoComplete="off"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="grossWeight">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-dispatch-gross-weight">
                  Gross weight (optional)
                </FieldLabel>
                <Input
                  id="edit-dispatch-gross-weight"
                  name={field.name}
                  inputMode="decimal"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Total weight"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="tareWeight">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-dispatch-tare-weight">Tare weight (optional)</FieldLabel>
                <Input
                  id="edit-dispatch-tare-weight"
                  name={field.name}
                  inputMode="decimal"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Tare weight"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({
            grossWeight: state.values.grossWeight,
            tareWeight: state.values.tareWeight,
          })}
        >
          {({ grossWeight, tareWeight }) => {
            const net = calculatedNetWeight(grossWeight, tareWeight);
            if (net == null) return null;
            return (
              <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Calculated net weight
                </span>
                <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                  {net.toLocaleString('en-IN')} kg
                </span>
              </div>
            );
          }}
        </form.Subscribe>

        <form.Field name="remarks">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="edit-dispatch-remarks">Remarks (optional)</FieldLabel>
                <Textarea
                  id="edit-dispatch-remarks"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Add any additional comments or observations"
                  className="min-h-24 resize-y"
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
