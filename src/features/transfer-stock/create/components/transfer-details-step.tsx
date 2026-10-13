import { useForm } from '@tanstack/react-form';
import type { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  DatePickerInput,
  formatDateOnlyString,
  parseDateOnlyString,
} from '@/components/ui/date-picker';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TransferLinesList } from '@/features/transfer-stock/components/transfer-lines-list';
import type { SelectedTransferLine } from '@/features/transfer-stock/create/lib/stock-lines';
import { totalSelectedBags } from '@/features/transfer-stock/create/lib/stock-lines';
import {
  type CreateTransferInput,
  emptyTransferDetailsValues,
  type TransferDetailsInput,
  todayDateOnly,
  transferDetailsSchema,
} from '@/features/transfer-stock/create/lib/transfer.schema';
import { formatFarmerLabel } from '@/features/transfer-stock/lib/format';

type TransferDetailsStepProps = {
  fromFarmer: { name: string; accountNumber?: string | null };
  toFarmer: { name: string; accountNumber?: string | null };
  fromFarmerId: string;
  toFarmerId: string;
  lines: SelectedTransferLine[];
  defaultValues?: TransferDetailsInput;
  isPending?: boolean;
  onDraftChange?: (values: TransferDetailsInput) => void;
  onBack: () => void;
  onSubmit: (values: CreateTransferInput) => void | Promise<void>;
};

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseWeightValue(value: string): number {
  if (value === '') return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function preventImplicitFormSubmit(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key === 'Enter' && (event.target as HTMLElement).tagName === 'INPUT') {
    event.preventDefault();
  }
}

export function TransferDetailsStep({
  fromFarmer,
  toFarmer,
  fromFarmerId,
  toFarmerId,
  lines,
  defaultValues = emptyTransferDetailsValues,
  isPending = false,
  onDraftChange,
  onBack,
  onSubmit,
}: TransferDetailsStepProps) {
  const totalBags = totalSelectedBags(lines);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: transferDetailsSchema,
    },
    listeners: {
      onChange: ({ formApi }) => {
        onDraftChange?.(formApi.state.values);
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        transferDate: (value.transferDate ?? '').trim() || todayDateOnly(),
        truckNumber: value.truckNumber.toUpperCase(),
        fromFarmerId,
        toFarmerId,
        lines: lines.map((line) => ({
          varietyId: line.varietyId,
          sizeId: line.sizeId,
          generationId: line.generationId,
          bagQuantity: line.bagQuantity,
        })),
      });
    },
  });

  return (
    <form
      id="create-transfer-form"
      noValidate
      onKeyDown={preventImplicitFormSubmit}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isPending) return;
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="@container/field-group gap-10">
        <FieldSet>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <FieldLegend className="text-base font-semibold">Selected bags</FieldLegend>
            <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={onBack}>
              Edit selection
            </Button>
          </div>
          <FieldDescription>
            {formatFarmerLabel(fromFarmer)} to {formatFarmerLabel(toFarmer)} · {totalBags}{' '}
            {totalBags === 1 ? 'bag' : 'bags'}
          </FieldDescription>
          <div className="mt-4">
            <TransferLinesList
              lines={lines.map((line) => ({
                key: line.stockId,
                varietyName: line.varietyName,
                sizeName: line.sizeName,
                generationName: line.generationName,
                bagQuantity: line.bagQuantity,
              }))}
            />
          </div>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend className="text-base font-semibold">General information</FieldLegend>
          <FieldDescription>Transport timing and the truck carrying these bags.</FieldDescription>
          <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
            <form.Field name="transferDate">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);
                const selectedDate = field.state.value
                  ? parseDateOnlyString(field.state.value)
                  : undefined;

                return (
                  <Field data-invalid={isInvalid}>
                    <DatePickerInput
                      id="transfer-date"
                      label="Transfer date"
                      placeholder="Select date"
                      value={selectedDate}
                      aria-invalid={isInvalid}
                      onChange={(date) => {
                        field.handleChange(date ? formatDateOnlyString(date) : '');
                      }}
                      onBlur={field.handleBlur}
                    />
                    <FieldDescription>Defaults to today if left blank.</FieldDescription>
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
                    <FieldLabel htmlFor="transfer-truck-number">Truck number</FieldLabel>
                    <Input
                      id="transfer-truck-number"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                      aria-invalid={isInvalid}
                      placeholder="e.g. PB08 AB 1234"
                      className="uppercase"
                      autoComplete="off"
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
                    <FieldLabel htmlFor="transfer-gate-pass">
                      Manual gate pass number (optional)
                    </FieldLabel>
                    <Input
                      id="transfer-gate-pass"
                      name={field.name}
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. GP-1042"
                      autoComplete="off"
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
                    <FieldLabel htmlFor="transfer-driver-mobile">
                      Driver mobile number (optional)
                    </FieldLabel>
                    <Input
                      id="transfer-driver-mobile"
                      name={field.name}
                      inputMode="tel"
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="10-digit mobile number"
                      autoComplete="off"
                    />
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend className="text-base font-semibold">Destination</FieldLegend>
          <FieldDescription>Where this truck is headed.</FieldDescription>
          <FieldGroup className="mt-5">
            <form.Field name="toLocation">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="transfer-to-location">Destination</FieldLabel>
                    <Input
                      id="transfer-to-location"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter destination"
                      autoComplete="off"
                    />
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend className="text-base font-semibold">Weight slip</FieldLegend>
          <FieldDescription>Details captured from the weighbridge slip.</FieldDescription>
          <form.Subscribe
            selector={(state) => ({
              grossWeight: state.values.grossWeight,
              tareWeight: state.values.tareWeight,
            })}
          >
            {({ grossWeight, tareWeight }) => {
              const hasGrossWeight = (grossWeight ?? '').trim().length > 0;
              const hasTareWeight = (tareWeight ?? '').trim().length > 0;
              const gross = parseWeightValue(grossWeight ?? '');
              const tare = parseWeightValue(tareWeight ?? '');
              const net = gross - tare;
              const hasCalculatedNet = hasGrossWeight && hasTareWeight && net >= 0;
              const tareExceedsGross = hasGrossWeight && hasTareWeight && net < 0;
              const average = hasCalculatedNet && totalBags > 0 ? net / totalBags : null;

              return (
                <>
                  <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                    <form.Field name="weightSlipNumber">
                      {(field) => {
                        const isInvalid = isFieldInvalid(field.state.meta);
                        return (
                          <Field data-invalid={isInvalid} className="@md/field-group:col-span-2">
                            <FieldLabel htmlFor="transfer-weight-slip">
                              Weight slip number (optional)
                            </FieldLabel>
                            <Input
                              id="transfer-weight-slip"
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="e.g. WS-1042"
                              autoComplete="off"
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
                            <FieldLabel htmlFor="transfer-gross-weight">
                              Gross weight (optional)
                            </FieldLabel>
                            <Input
                              id="transfer-gross-weight"
                              name={field.name}
                              inputMode="decimal"
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="Total weight"
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
                            <FieldLabel htmlFor="transfer-tare-weight">
                              Tare weight (optional)
                            </FieldLabel>
                            <Input
                              id="transfer-tare-weight"
                              name={field.name}
                              inputMode="decimal"
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="Tare weight"
                            />
                            {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                          </Field>
                        );
                      }}
                    </form.Field>
                  </FieldGroup>

                  {tareExceedsGross ? (
                    <p className="text-destructive mt-4 text-sm">
                      Tare weight cannot exceed gross weight.
                    </p>
                  ) : null}

                  {hasCalculatedNet ? (
                    <div className="mt-6 grid grid-cols-1 gap-3 @md/field-group:grid-cols-2">
                      <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                        <span className="text-muted-foreground text-sm font-medium">
                          Calculated net weight
                        </span>
                        <span className="text-foreground text-lg font-semibold tabular-nums">
                          {net.toLocaleString('en-IN')} kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                        <span className="text-muted-foreground text-sm font-medium">
                          Calculated avg. weight per bag
                        </span>
                        <span className="text-foreground text-lg font-semibold tabular-nums">
                          {average != null ? `${average.toLocaleString('en-IN')} kg` : '—'}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </>
              );
            }}
          </form.Subscribe>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend className="text-base font-semibold">Additional notes</FieldLegend>
          <FieldGroup className="mt-5">
            <form.Field name="remarks">
              {(field) => {
                const isInvalid = isFieldInvalid(field.state.meta);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="transfer-remarks" className="sr-only">
                      Remarks
                    </FieldLabel>
                    <Textarea
                      id="transfer-remarks"
                      name={field.name}
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Add any additional comments (optional)"
                      className="min-h-28 resize-y"
                    />
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11 sm:min-h-9">
          Back
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button
              type="submit"
              disabled={!canSubmit || isPending}
              className="min-h-11 sm:min-h-9"
            >
              {isPending ? 'Creating…' : 'Create transfer'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
