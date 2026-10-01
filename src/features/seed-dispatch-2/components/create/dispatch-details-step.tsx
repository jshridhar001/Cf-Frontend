import { useForm } from '@tanstack/react-form';
import { type KeyboardEvent, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  type DispatchRequisitionSelectionMap,
  getSelectionTotal,
  selectionsToInput,
} from '@/features/seed-dispatch/lib/dispatch-form-types';
import type { DispatchFormOptions } from '@/features/seed-dispatch/lib/form-options';
import {
  type CreateDispatchInput,
  type DispatchCreateStep2Input,
  dispatchCreateStep2Schema,
  emptyDispatchCreateStep2Values,
  todayDateOnly,
} from '@/features/seed-dispatch/schemas/dispatch.schema';
import type { DispatchableRequisition } from '@/features/seed-dispatch/types';
import { formatSeedSize } from '@/lib/format-seed-size';

type DispatchDetailsStepProps = {
  selections: DispatchRequisitionSelectionMap;
  requisitions: DispatchableRequisition[];
  formOptions: DispatchFormOptions;
  defaultValues?: DispatchCreateStep2Input;
  isPending?: boolean;
  onDraftChange?: (values: DispatchCreateStep2Input) => void;
  onBack: () => void;
  onSubmit: (values: CreateDispatchInput) => void | Promise<void>;
};

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseWeightValue(value: string): number {
  if (value === '') return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatWeightValue(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function preventImplicitFormSubmit(e: KeyboardEvent<HTMLFormElement>) {
  if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
    e.preventDefault();
  }
}

export function DispatchDetailsStep({
  selections,
  requisitions,
  formOptions,
  defaultValues = emptyDispatchCreateStep2Values,
  isPending = false,
  onDraftChange,
  onBack,
  onSubmit,
}: DispatchDetailsStepProps) {
  const facilities = formOptions.facilities;
  const sizes = formOptions.sizes;
  const generations = formOptions.generations;

  const sizeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const size of sizes) {
      map.set(size.id, size.name);
    }
    return map;
  }, [sizes]);

  const generationNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const generation of generations) {
      map.set(generation.id, generation.name);
    }
    return map;
  }, [generations]);

  const requisitionById = useMemo(() => {
    const map = new Map<string, DispatchableRequisition>();
    for (const row of requisitions) {
      map.set(row.id, row);
    }
    return map;
  }, [requisitions]);

  const summaryRows = useMemo(
    () =>
      selectionsToInput(selections).map((selection) => ({
        ...selection,
        requisition: requisitionById.get(selection.requisitionId),
        total: getSelectionTotal(selection.sizeLines),
      })),
    [selections, requisitionById],
  );
  const totalBags = useMemo(
    () => summaryRows.reduce((sum, row) => sum + row.total, 0),
    [summaryRows],
  );
  const totalLineCount = useMemo(
    () => summaryRows.reduce((sum, row) => sum + row.sizeLines.length, 0),
    [summaryRows],
  );
  const totalBagLines = useMemo(
    () =>
      summaryRows.reduce(
        (sum, row) =>
          sum +
          row.sizeLines.reduce((lineSum, line) => lineSum + Number.parseFloat(line.quantity), 0),
        0,
      ),
    [summaryRows],
  );

  const facilityNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const facility of facilities) {
      map.set(facility.id, facility.name);
    }
    return map;
  }, [facilities]);

  const facilityBagSummary = useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of summaryRows) {
      for (const line of row.sizeLines) {
        const qty = Number.parseFloat(line.quantity);
        if (!Number.isFinite(qty)) continue;
        totals.set(line.facilityId, (totals.get(line.facilityId) ?? 0) + qty);
      }
    }
    return Array.from(totals.entries()).map(([facilityId, bags]) => ({
      facilityId,
      name: facilityNameById.get(facilityId) ?? facilityId,
      bags,
    }));
  }, [summaryRows, facilityNameById]);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: dispatchCreateStep2Schema,
    },
    listeners: {
      onChange: ({ formApi }) => {
        onDraftChange?.(formApi.state.values as DispatchCreateStep2Input);
      },
    },
    onSubmit: async ({ value }) => {
      const requisitionInput = selectionsToInput(selections);
      const hasGrossWeight = (value.grossWeight ?? '').trim().length > 0;
      const hasTareWeight = (value.tareWeight ?? '').trim().length > 0;
      const grossWeight = parseWeightValue(value.grossWeight ?? '');
      const tareWeight = parseWeightValue(value.tareWeight ?? '');
      const netWeight = grossWeight - tareWeight;
      const hasCalculatedNet = hasGrossWeight && hasTareWeight && netWeight >= 0;
      const hasCalculatedAverage = hasCalculatedNet && totalBags > 0;
      await onSubmit({
        ...value,
        dispatchDate: (value.dispatchDate ?? '').trim() || todayDateOnly(),
        truckNumber: value.truckNumber.toUpperCase(),
        netWeight: hasCalculatedNet ? formatWeightValue(netWeight) : '',
        averageWeightPerBag: hasCalculatedAverage ? formatWeightValue(netWeight / totalBags) : '',
        requisitions: requisitionInput,
      });
    },
  });

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="text-2xl">Dispatch details</CardTitle>
        <CardDescription className="text-base">
          Review selected requisitions and enter transport, facility, and weighbridge details for
          this dispatch.
        </CardDescription>
      </CardHeader>

      <form
        id="create-dispatch-form"
        noValidate
        onKeyDown={preventImplicitFormSubmit}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (isPending) return;
          void form.handleSubmit();
        }}
      >
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <FieldLegend className="text-lg font-semibold">Selected requisitions</FieldLegend>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  onClick={onBack}
                >
                  Edit selection
                </Button>
              </div>
              <FieldDescription>
                Review graded seed bag counts and source facilities before entering dispatch
                details.
              </FieldDescription>
              {facilityBagSummary.length > 0 ? (
                <p className="text-muted-foreground mt-3 text-sm">
                  From facilities:{' '}
                  {facilityBagSummary.map((item) => `${item.name} (${item.bags} bags)`).join(' · ')}
                </p>
              ) : null}
              <div className="mt-5 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-center">Farmer</TableHead>
                      <TableHead className="text-center">Variety</TableHead>
                      <TableHead className="text-center">Facility</TableHead>
                      <TableHead className="text-center">Generation</TableHead>
                      <TableHead className="text-center">Seed Size</TableHead>
                      <TableHead className="text-center">Seed Bags</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryRows.flatMap((row) =>
                      row.sizeLines.map((line, lineIndex) => (
                        <TableRow
                          key={`${row.requisitionId}-${line.facilityId}-${line.sizeId}-${line.generationId}`}
                        >
                          {lineIndex === 0 ? (
                            <>
                              <TableCell
                                className="text-center whitespace-normal"
                                rowSpan={row.sizeLines.length}
                              >
                                <span className="font-medium">
                                  {row.requisition?.farmer.name ?? '—'}
                                </span>{' '}
                                <span className="text-muted-foreground">
                                  #{row.requisition?.farmer.accountNumber ?? '—'}
                                </span>
                              </TableCell>
                              <TableCell className="text-center" rowSpan={row.sizeLines.length}>
                                {row.requisition?.variety.name ?? '—'}
                              </TableCell>
                            </>
                          ) : null}
                          <TableCell className="text-center">
                            {facilityNameById.get(line.facilityId) ?? '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            {generationNameById.get(line.generationId) ?? '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatSeedSize(sizeNameById.get(line.sizeId) ?? '—')}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {line.quantity}
                          </TableCell>
                          {lineIndex === 0 ? (
                            <TableCell
                              className="text-center font-medium tabular-nums"
                              rowSpan={row.sizeLines.length}
                            >
                              {row.total}
                            </TableCell>
                          ) : null}
                        </TableRow>
                      )),
                    )}
                  </TableBody>
                  {totalLineCount > 1 ? (
                    <TableFooter>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell colSpan={5} className="text-center font-medium">
                          Total
                        </TableCell>
                        <TableCell className="text-center font-medium tabular-nums">
                          {totalBagLines}
                        </TableCell>
                        <TableCell className="text-center font-medium tabular-nums">
                          {totalBags}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  ) : null}
                </Table>
              </div>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="text-lg font-semibold">General information</FieldLegend>
              <FieldDescription>Basic details regarding transport and timing.</FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="dispatchDate">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    const selectedDate = field.state.value
                      ? parseDateOnlyString(field.state.value)
                      : undefined;

                    return (
                      <Field data-invalid={isInvalid}>
                        <DatePickerInput
                          id="dispatch-date"
                          label="Dispatch date"
                          placeholder="Select date"
                          value={selectedDate}
                          aria-invalid={isInvalid}
                          onChange={(date) => {
                            field.handleChange(date ? formatDateOnlyString(date) : '');
                          }}
                          onBlur={field.handleBlur}
                        />
                        <FieldDescription>
                          Type a date or pick from the calendar. Defaults to today if left blank.
                        </FieldDescription>
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
                        <FieldLabel htmlFor="dispatch-truck-number">Truck number</FieldLabel>
                        <Input
                          id="dispatch-truck-number"
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
                        <FieldLabel htmlFor="dispatch-manual-gate-pass">
                          Manual Gate Pass Number (optional)
                        </FieldLabel>
                        <Input
                          id="dispatch-manual-gate-pass"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g. 1024"
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Leave blank if no Manual Gate Pass Number was issued.
                        </FieldDescription>
                        {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="driverMobile">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid} className="@md/field-group:col-span-2">
                        <FieldLabel htmlFor="dispatch-driver-mobile">
                          Driver mobile number (optional)
                        </FieldLabel>
                        <Input
                          id="dispatch-driver-mobile"
                          name={field.name}
                          inputMode="tel"
                          value={field.state.value}
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
              <FieldLegend className="text-lg font-semibold">Destination</FieldLegend>
              <FieldDescription>
                Destination for this truck. Source facilities are set per size line in step 1.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                <form.Field name="toLocation">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="dispatch-to-location">Destination</FieldLabel>
                        <Input
                          id="dispatch-to-location"
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
              <FieldLegend className="text-lg font-semibold">Weight Slip Number data</FieldLegend>
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
                  const hasCalculatedAverage = hasCalculatedNet && totalBags > 0;
                  const averageWeightPerBag = hasCalculatedAverage ? net / totalBags : 0;

                  return (
                    <>
                      <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                        <form.Field name="weightSlipNumber">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="dispatch-weight-slip-number">
                                  Weight Slip Number (optional)
                                </FieldLabel>
                                <Input
                                  id="dispatch-weight-slip-number"
                                  name={field.name}
                                  inputMode="numeric"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  aria-invalid={isInvalid}
                                  placeholder="e.g. 1024"
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
                                <FieldLabel htmlFor="dispatch-gross-weight">
                                  Gross weight (optional)
                                </FieldLabel>
                                <Input
                                  id="dispatch-gross-weight"
                                  name={field.name}
                                  inputMode="decimal"
                                  value={field.state.value}
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
                                <FieldLabel htmlFor="dispatch-tare-weight">
                                  Tare weight (optional)
                                </FieldLabel>
                                <Input
                                  id="dispatch-tare-weight"
                                  name={field.name}
                                  inputMode="decimal"
                                  value={field.state.value}
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

                      {hasCalculatedNet ? (
                        <div className="mt-6 grid grid-cols-1 gap-3 @md/field-group:grid-cols-2">
                          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              Calculated net weight
                            </span>
                            <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                              {net.toLocaleString('en-IN')} kg
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              Calculated avg. weight per bag
                            </span>
                            <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                              {hasCalculatedAverage
                                ? `${averageWeightPerBag.toLocaleString('en-IN')} kg`
                                : '—'}
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
              <FieldLegend className="text-lg font-semibold">Additional notes</FieldLegend>
              <FieldGroup className="mt-5">
                <form.Field name="remarks">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="dispatch-remarks" className="sr-only">
                          Remarks
                        </FieldLabel>
                        <Textarea
                          id="dispatch-remarks"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Add any additional comments or observations (optional)"
                          className="min-h-[120px] resize-y"
                        />
                        {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-between gap-3 border-t bg-muted/30 py-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit || isPending}>
                {isPending ? 'Creating…' : 'Create dispatch'}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
}
