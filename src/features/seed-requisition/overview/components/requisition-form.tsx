import { useForm } from '@tanstack/react-form';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect } from 'react';
import * as z from 'zod';
import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import {
  DatePickerInput,
  formatDateOnlyString,
  parseDateOnlyString,
} from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { useVarieties } from '@/features/master/api/use-varieties';
import { useCreateSeedRequisition } from '@/features/seed-requisition/overview/api/use-create-seed-requisition';
import { useUpdateSeedRequisition } from '@/features/seed-requisition/overview/api/use-update-seed-requisition';
import {
  type DeliveryScheduleLine,
  scheduledQuantity,
  validateDeliverySchedule,
} from '@/features/seed-requisition/overview/lib/requested-deliveries';
import {
  type CreateSeedRequisitionBody,
  parseRequestedAcres,
  type SeedRequisition,
  type SeedRequisitionOption,
  toDateInputValue,
  toRequisitionDateParam,
} from '@/features/seed-requisition/overview/types';

const ACRES_MAX_DECIMALS = 2;
const QUANTITY_TYPES = ['bags', 'acres'] as const;

const QUANTITY_TAB_LIST_CLASS =
  'grid h-11 w-full min-w-0 grid-cols-2 items-stretch overflow-hidden rounded-full bg-muted p-1 group-data-horizontal/tabs:h-11 sm:h-10 sm:group-data-horizontal/tabs:h-10';

const QUANTITY_TAB_TRIGGER_CLASS =
  'h-full min-h-0 w-full min-w-0 rounded-full border-0 px-2 py-0 shadow-none ring-0 after:hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground';

function sanitizeAcresInput(raw: string): string {
  const value = raw.replace(/[^\d.]/g, '');
  const firstDot = value.indexOf('.');
  if (firstDot === -1) return value;
  const integer = value.slice(0, firstDot);
  const fraction = value
    .slice(firstDot + 1)
    .replace(/\./g, '')
    .slice(0, ACRES_MAX_DECIMALS);
  return `${integer}.${fraction}`;
}

function acresHasAtMostDecimals(value: string, maxDecimals: number): boolean {
  const fraction = value.trim().split('.')[1];
  return !fraction || fraction.length <= maxDecimals;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function createFormSchema(allowZero: boolean) {
  const isBelowMin = (quantity: number) => (allowZero ? quantity < 0 : quantity <= 0);
  return z
    .object({
      farmerId: z.string().min(1, 'Select a farmer.'),
      varietyId: z.string().min(1, 'Select a variety.'),
      quantityType: z.enum(QUANTITY_TYPES),
      requestedBags: z.string(),
      requestedAcres: z.string(),
      contractDate: z.string().min(1, 'Contract date is required.'),
      requisitionDate: z.string(),
      requestedDeliveries: z.array(
        z.object({
          key: z.string(),
          deliveryDate: z.string(),
          quantity: z.string(),
        }),
      ),
      remarks: z.string(),
      engContractUrl: z.string(),
      hindiContractUrl: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.engContractUrl.trim() && !isHttpUrl(value.engContractUrl.trim())) {
        ctx.addIssue({
          code: 'custom',
          path: ['engContractUrl'],
          message: 'Enter a valid URL.',
        });
      }
      if (value.hindiContractUrl.trim() && !isHttpUrl(value.hindiContractUrl.trim())) {
        ctx.addIssue({
          code: 'custom',
          path: ['hindiContractUrl'],
          message: 'Enter a valid URL.',
        });
      }
      if (value.quantityType === 'bags') {
        const bags = Number(value.requestedBags);
        if (!value.requestedBags.trim() || !Number.isInteger(bags) || isBelowMin(bags)) {
          ctx.addIssue({
            code: 'custom',
            path: ['requestedBags'],
            message: allowZero
              ? 'Enter a whole number of bags, 0 or greater.'
              : 'Enter a whole number of bags greater than 0.',
          });
        }
      } else {
        const acres = Number(value.requestedAcres);
        if (!value.requestedAcres.trim() || !Number.isFinite(acres) || isBelowMin(acres)) {
          ctx.addIssue({
            code: 'custom',
            path: ['requestedAcres'],
            message: allowZero ? 'Enter acres, 0 or greater.' : 'Enter acres greater than 0.',
          });
        } else if (!acresHasAtMostDecimals(value.requestedAcres, ACRES_MAX_DECIMALS)) {
          ctx.addIssue({
            code: 'custom',
            path: ['requestedAcres'],
            message: `Enter acres with up to ${ACRES_MAX_DECIMALS} decimal places.`,
          });
        }
      }

      const scheduleIssues = validateDeliverySchedule({
        quantityType: value.quantityType,
        total:
          value.quantityType === 'bags'
            ? Number(value.requestedBags)
            : Number(value.requestedAcres),
        lines: value.requestedDeliveries,
      });
      for (const issue of scheduleIssues) {
        ctx.addIssue({
          code: 'custom',
          path: ['requestedDeliveries', ...issue.path],
          message: issue.message,
        });
      }
    });
}

type FormDeliveryLine = DeliveryScheduleLine & { key: string };

function deliveryLinesFromRequisition(
  requisition?: SeedRequisition | null,
): FormDeliveryLine[] {
  return (requisition?.requestedDeliveries ?? []).map((line) => ({
    key: line.id ?? crypto.randomUUID(),
    deliveryDate: toDateInputValue(line.deliveryDate),
    quantity:
      line.bags != null
        ? String(line.bags)
        : line.acres != null && line.acres !== ''
          ? String(Number(line.acres))
          : '',
  }));
}

function remainingScheduleLabel(
  quantityType: 'bags' | 'acres',
  totalText: string,
  lines: FormDeliveryLine[],
) {
  const total = Number(totalText);
  if (!totalText.trim() || !Number.isFinite(total)) {
    return 'Add a total, then split it across delivery dates.';
  }
  const scheduled = scheduledQuantity(lines);
  const remaining = Number((total - scheduled).toFixed(2));
  const unit =
    quantityType === 'bags'
      ? Math.abs(remaining) === 1
        ? 'bag'
        : 'bags'
      : Math.abs(remaining) === 1
        ? 'acre'
        : 'acres';
  const amount =
    quantityType === 'bags' ? String(Math.abs(Math.trunc(remaining))) : String(Math.abs(remaining));
  if (remaining > 0.001) return `${amount} ${unit} still unscheduled.`;
  if (remaining < -0.001) return `${amount} ${unit} over the requested total.`;
  return 'The full quantity is scheduled.';
}

interface RequisitionFormProps {
  requisition?: SeedRequisition | null;
  lockedFarmerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RequisitionForm({
  requisition,
  lockedFarmerId,
  onSuccess,
  onCancel,
}: RequisitionFormProps) {
  const isEdit = requisition != null;
  const lockFarmer = !isEdit && Boolean(lockedFarmerId);
  const createRequisition = useCreateSeedRequisition();
  const updateRequisition = useUpdateSeedRequisition();
  const { data: farmerRecords, isPending: farmersPending } = useFarmers();
  const { data: varietyRecords, isPending: varietiesPending } = useVarieties();
  const farmers: SeedRequisitionOption[] = (farmerRecords ?? []).map((farmer) => ({
    id: farmer.id,
    name: farmer.name,
    accountNumber: farmer.accountNumber,
  }));
  const varieties: SeedRequisitionOption[] = (varietyRecords ?? []).map((variety) => ({
    id: variety.id,
    name: variety.name,
  }));
  const optionsPending = farmersPending || varietiesPending;
  const isSavingForm = createRequisition.isPending || updateRequisition.isPending;
  const isPending = isSavingForm || optionsPending;

  const form = useForm({
    defaultValues: {
      farmerId: requisition?.farmerId ?? lockedFarmerId ?? '',
      varietyId: requisition?.varietyId ?? '',
      quantityType:
        !requisition ||
        (requisition.requestedAcres != null && requisition.requestedAcres !== '') ||
        requisition.requestedBags == null
          ? ('acres' as const)
          : ('bags' as const),
      requestedBags: requisition?.requestedBags != null ? String(requisition.requestedBags) : '',
      requestedAcres: requisition?.requestedAcres != null ? String(requisition.requestedAcres) : '',
      contractDate: requisition?.contractDate
        ? toDateInputValue(requisition.contractDate)
        : todayIsoDate(),
      requisitionDate: requisition ? toDateInputValue(requisition.requisitionDate) : '',
      requestedDeliveries: deliveryLinesFromRequisition(requisition),
      remarks: requisition?.remarks ?? '',
      engContractUrl: requisition?.engContractUrl ?? '',
      hindiContractUrl: requisition?.hindiContractUrl ?? '',
    },
    validators: {
      onSubmit: createFormSchema(isEdit),
    },
    onSubmit: async ({ value }) => {
      const remarks = value.remarks.trim();
      const requisitionDate = value.requisitionDate.trim();
      const requestedDeliveries = value.requestedDeliveries
        .filter((line) => line.deliveryDate.trim() && line.quantity.trim())
        .map((line) => ({
          deliveryDate: toRequisitionDateParam(line.deliveryDate),
          ...(value.quantityType === 'bags'
            ? { bags: Number(line.quantity) }
            : { acres: parseRequestedAcres(line.quantity) }),
        }));
      const body: CreateSeedRequisitionBody = {
        farmerId: value.farmerId,
        varietyId: value.varietyId,
        contractDate: toRequisitionDateParam(value.contractDate),
        ...(requisitionDate ? { requisitionDate: toRequisitionDateParam(requisitionDate) } : {}),
        ...(isEdit || requestedDeliveries.length > 0 ? { requestedDeliveries } : {}),
        ...(remarks ? { remarks } : {}),
        ...(value.quantityType === 'bags'
          ? { requestedBags: Number(value.requestedBags) }
          : { requestedAcres: parseRequestedAcres(value.requestedAcres) }),
        ...(isEdit
          ? {
              engContractUrl: value.engContractUrl.trim() || null,
              hindiContractUrl: value.hindiContractUrl.trim() || null,
            }
          : {}),
      };

      if (isEdit) {
        await updateRequisition.mutateAsync({ requisitionId: requisition.id, body });
      } else {
        await createRequisition.mutateAsync(body);
        form.reset();
      }
      onSuccess?.();
    },
  });

  const singleFarmerId = !isEdit && !lockedFarmerId && farmers.length === 1 ? farmers[0].id : '';

  useEffect(() => {
    if (lockedFarmerId && !isEdit && form.state.values.farmerId !== lockedFarmerId) {
      form.setFieldValue('farmerId', lockedFarmerId);
      return;
    }
    if (!singleFarmerId || form.state.values.farmerId) return;
    form.setFieldValue('farmerId', singleFarmerId);
  }, [form, isEdit, lockedFarmerId, singleFarmerId]);

  return (
    <form
      id={isEdit ? 'edit-requisition-form' : 'create-requisition-form'}
      className="min-w-0"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="farmerId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Farmer</FieldLabel>
                <SearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select farmer"
                  emptyMessage="No farmers found"
                  disabled={isPending || lockFarmer}
                  options={farmers.map((farmer) => ({
                    id: farmer.id,
                    label: farmer.accountNumber
                      ? `${farmer.name} (#${farmer.accountNumber})`
                      : farmer.name,
                  }))}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="varietyId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Variety</FieldLabel>
                <SearchableOptionCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  placeholder="Select variety"
                  emptyMessage="No varieties found"
                  disabled={isPending}
                  options={varieties.map((variety) => ({
                    id: variety.id,
                    label: variety.name,
                  }))}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="quantityType">
          {(quantityField) => (
            <Field className="w-full min-w-0">
              <FieldLabel>Quantity</FieldLabel>
              <Tabs
                value={quantityField.state.value}
                onValueChange={(next) => {
                  if (next === 'bags' || next === 'acres') quantityField.handleChange(next);
                }}
                className="w-full min-w-0 gap-3"
              >
                <TabsList className={QUANTITY_TAB_LIST_CLASS}>
                  <TabsTrigger
                    value="acres"
                    disabled={isPending}
                    className={QUANTITY_TAB_TRIGGER_CLASS}
                  >
                    Acres
                  </TabsTrigger>
                  <TabsTrigger
                    value="bags"
                    disabled={isPending}
                    className={QUANTITY_TAB_TRIGGER_CLASS}
                  >
                    Bags
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="acres">
                  <form.Field name="requestedAcres">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Requested acres</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            inputMode="decimal"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(sanitizeAcresInput(e.target.value))}
                            aria-invalid={isInvalid}
                            placeholder="2.50"
                            disabled={isPending}
                          />
                          {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                </TabsContent>
                <TabsContent value="bags">
                  <form.Field name="requestedBags">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Requested bags</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            inputMode="numeric"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(e.target.value.replace(/[^\d]/g, ''))
                            }
                            aria-invalid={isInvalid}
                            placeholder="40"
                            disabled={isPending}
                          />
                          {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                </TabsContent>
              </Tabs>
            </Field>
          )}
        </form.Field>

        <form.Field name="contractDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <DatePickerInput
                  id={field.name}
                  label="Contract date"
                  placeholder="Select date"
                  value={field.state.value ? parseDateOnlyString(field.state.value) : undefined}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  onChange={(date) => field.handleChange(date ? formatDateOnlyString(date) : '')}
                  onBlur={field.handleBlur}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="requisitionDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <DatePickerInput
                  id={field.name}
                  label="Requisition date (optional)"
                  placeholder="Select date"
                  value={field.state.value ? parseDateOnlyString(field.state.value) : undefined}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                  onChange={(date) => field.handleChange(date ? formatDateOnlyString(date) : '')}
                  onBlur={field.handleBlur}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="requestedDeliveries" mode="array">
          {(field) => {
            const scheduleError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel>Requested deliveries (optional)</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      field.pushValue({ key: crypto.randomUUID(), deliveryDate: '', quantity: '' })
                    }
                  >
                    <PlusIcon />
                    Add delivery
                  </Button>
                </div>
                <form.Subscribe
                  selector={(state) => ({
                    quantityType: state.values.quantityType,
                    total:
                      state.values.quantityType === 'bags'
                        ? state.values.requestedBags
                        : state.values.requestedAcres,
                    lines: state.values.requestedDeliveries,
                  })}
                >
                  {(snapshot) => (
                    <p className="text-sm text-muted-foreground">
                      {remainingScheduleLabel(
                        snapshot.quantityType,
                        snapshot.total,
                        snapshot.lines,
                      )}
                    </p>
                  )}
                </form.Subscribe>
                {field.state.value.map((line, index) => (
                  <div
                    key={line.key}
                    className="grid grid-cols-[minmax(0,1fr)_7.5rem_auto] items-start gap-2"
                  >
                    <form.Field name={`requestedDeliveries[${index}].deliveryDate`}>
                      {(dateField) => {
                        const isInvalid =
                          dateField.state.meta.isTouched && !dateField.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <DatePickerInput
                              id={dateField.name}
                              label={index === 0 ? 'Date' : undefined}
                              placeholder="Select date"
                              value={
                                dateField.state.value
                                  ? parseDateOnlyString(dateField.state.value)
                                  : undefined
                              }
                              aria-invalid={isInvalid}
                              disabled={isPending}
                              onChange={(date) =>
                                dateField.handleChange(date ? formatDateOnlyString(date) : '')
                              }
                              onBlur={dateField.handleBlur}
                            />
                            {isInvalid ? <FieldError errors={dateField.state.meta.errors} /> : null}
                          </Field>
                        );
                      }}
                    </form.Field>
                    <form.Subscribe selector={(state) => state.values.quantityType}>
                      {(quantityType) => (
                        <form.Field name={`requestedDeliveries[${index}].quantity`}>
                          {(quantityField) => {
                            const isInvalid =
                              quantityField.state.meta.isTouched &&
                              !quantityField.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid}>
                                {index === 0 ? (
                                  <FieldLabel htmlFor={quantityField.name}>
                                    {quantityType === 'bags' ? 'Bags' : 'Acres'}
                                  </FieldLabel>
                                ) : null}
                                <Input
                                  id={quantityField.name}
                                  name={quantityField.name}
                                  inputMode={quantityType === 'bags' ? 'numeric' : 'decimal'}
                                  value={quantityField.state.value}
                                  aria-invalid={isInvalid}
                                  disabled={isPending}
                                  onBlur={quantityField.handleBlur}
                                  onChange={(event) =>
                                    quantityField.handleChange(
                                      quantityType === 'bags'
                                        ? event.target.value.replace(/[^\d]/g, '')
                                        : sanitizeAcresInput(event.target.value),
                                    )
                                  }
                                />
                                {isInvalid ? (
                                  <FieldError errors={quantityField.state.meta.errors} />
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                      )}
                    </form.Subscribe>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={index === 0 ? 'mt-6' : undefined}
                      disabled={isPending}
                      aria-label="Remove delivery"
                      onClick={() => field.removeValue(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
                {scheduleError ? <FieldError errors={field.state.meta.errors} /> : null}
              </div>
            );
          }}
        </form.Field>

        {isEdit ? (
          <>
            <form.Field name="engContractUrl">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>English contract URL</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="url"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="https://"
                      disabled={isPending}
                    />
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="hindiContractUrl">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Hindi contract URL</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="url"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="https://"
                      disabled={isPending}
                    />
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                );
              }}
            </form.Field>
          </>
        ) : null}

        <form.Field name="remarks">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Remarks (optional)</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isPending}
              />
            </Field>
          )}
        </form.Field>
      </FieldGroup>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSavingForm}
          onClick={() => onCancel?.()}
        >
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isSavingForm ? 'Saving…' : isEdit ? 'Save changes' : 'Create requisition'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
