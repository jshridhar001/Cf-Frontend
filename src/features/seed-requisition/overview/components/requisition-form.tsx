import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { useVarieties } from '@/features/master/api/use-varieties';
import { useCreateSeedRequisition } from '@/features/seed-requisition/overview/api/use-create-seed-requisition';
import { useUpdateSeedRequisition } from '@/features/seed-requisition/overview/api/use-update-seed-requisition';
import { FarmerCombobox } from '@/features/seed-requisition/overview/components/farmer-combobox';
import {
  formatRequestedAcresPayload,
  type SeedRequisition,
  toDateInputValue,
  toRequisitionDateParam,
} from '@/features/seed-requisition/overview/types';

const ACRES_MAX_DECIMALS = 3;
const QUANTITY_TYPES = ['bags', 'acres'] as const;

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

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

const formSchema = z
  .object({
    farmerId: z.string().min(1, 'Select a farmer.'),
    varietyId: z.string().min(1, 'Select a variety.'),
    quantityType: z.enum(QUANTITY_TYPES),
    requestedBags: z.string(),
    requestedAcres: z.string(),
    requisitionDate: z.string().min(1, 'Requisition date is required.'),
    requestedDeliveryDate: z.string().min(1, 'Delivery date is required.'),
    remarks: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.quantityType === 'bags') {
      const bags = Number(value.requestedBags);
      if (!value.requestedBags.trim() || !Number.isInteger(bags) || bags <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['requestedBags'],
          message: 'Enter a whole number of bags greater than 0.',
        });
      }
    } else {
      const acres = Number(value.requestedAcres);
      if (!value.requestedAcres.trim() || !Number.isFinite(acres) || acres <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['requestedAcres'],
          message: 'Enter acres greater than 0.',
        });
      } else if (!acresHasAtMostDecimals(value.requestedAcres, ACRES_MAX_DECIMALS)) {
        ctx.addIssue({
          code: 'custom',
          path: ['requestedAcres'],
          message: `Enter acres with up to ${ACRES_MAX_DECIMALS} decimal places.`,
        });
      }
    }
  });

interface RequisitionFormProps {
  requisition?: SeedRequisition | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RequisitionForm({ requisition, onSuccess, onCancel }: RequisitionFormProps) {
  const isEdit = requisition != null;
  const { mutateAsync: createRequisition, isPending: isCreating } = useCreateSeedRequisition();
  const { mutateAsync: updateRequisition, isPending: isUpdating } = useUpdateSeedRequisition();
  const { data: farmers = [] } = useFarmers();
  const { data: varieties = [] } = useVarieties();
  const isPending = isCreating || isUpdating;

  const form = useForm({
    defaultValues: {
      farmerId: requisition?.farmerId ?? (farmers.length === 1 ? farmers[0].id : ''),
      varietyId: requisition?.varietyId ?? '',
      quantityType:
        requisition?.requestedAcres != null && requisition.requestedAcres !== ''
          ? ('acres' as const)
          : ('bags' as const),
      requestedBags: requisition?.requestedBags != null ? String(requisition.requestedBags) : '',
      requestedAcres: requisition?.requestedAcres != null ? String(requisition.requestedAcres) : '',
      requisitionDate: requisition ? toDateInputValue(requisition.requisitionDate) : todayIsoDate(),
      requestedDeliveryDate: requisition ? toDateInputValue(requisition.requestedDeliveryDate) : '',
      remarks: requisition?.remarks ?? '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const remarks = value.remarks.trim() || undefined;
      const quantity =
        value.quantityType === 'bags'
          ? { requestedBags: Number(value.requestedBags), requestedAcres: null }
          : {
              requestedBags: null,
              requestedAcres: formatRequestedAcresPayload(value.requestedAcres),
            };

      if (isEdit) {
        await updateRequisition({
          requisitionId: requisition.id,
          ...quantity,
          requestedDeliveryDate: toRequisitionDateParam(value.requestedDeliveryDate),
          remarks: remarks ?? null,
        });
      } else {
        await createRequisition({
          farmerId: value.farmerId,
          varietyId: value.varietyId,
          requisitionDate: toRequisitionDateParam(value.requisitionDate),
          requestedDeliveryDate: toRequisitionDateParam(value.requestedDeliveryDate),
          remarks,
          ...(value.quantityType === 'bags'
            ? { requestedBags: Number(value.requestedBags) }
            : { requestedAcres: formatRequestedAcresPayload(value.requestedAcres) }),
        });
        form.reset();
      }
      onSuccess?.();
    },
  });

  return (
    <form
      id={isEdit ? 'edit-requisition-form' : 'create-requisition-form'}
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
            const selectedFarmer = farmers.find((farmer) => farmer.id === field.state.value);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Farmer</FieldLabel>
                {isEdit ? (
                  <Input
                    id={field.name}
                    value={requisition.farmer?.name || selectedFarmer?.name || requisition.farmerId}
                    disabled
                    readOnly
                  />
                ) : (
                  <FarmerCombobox
                    id={field.name}
                    farmers={farmers}
                    value={field.state.value}
                    onValueChange={(next) => field.handleChange(next)}
                    disabled={isPending}
                    invalid={isInvalid}
                  />
                )}
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
                {isEdit ? (
                  <Input
                    id={field.name}
                    value={requisition.variety?.name || requisition.varietyId}
                    disabled
                    readOnly
                  />
                ) : (
                  <Select
                    name={field.name}
                    value={field.state.value}
                    disabled={isPending}
                    onValueChange={(next) => {
                      if (next) field.handleChange(next);
                    }}
                  >
                    <SelectTrigger id={field.name} aria-invalid={isInvalid} className="w-full">
                      <SelectValue placeholder="Select variety" />
                    </SelectTrigger>
                    <SelectContent>
                      {varieties.map((variety) => (
                        <SelectItem key={variety.id} value={variety.id}>
                          {variety.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                className="w-full gap-3"
              >
                <TabsList className="grid h-11 w-full grid-cols-2 bg-primary/10 p-1 sm:h-10">
                  <TabsTrigger
                    value="acres"
                    disabled={isPending}
                    className="min-h-9 w-full data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
                  >
                    Acres
                  </TabsTrigger>
                  <TabsTrigger
                    value="bags"
                    disabled={isPending}
                    className="min-h-9 w-full data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
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
                            placeholder="4.000"
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

        <form.Field name="requisitionDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Requisition date</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isPending || isEdit}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="requestedDeliveryDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Requested delivery date</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isPending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

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
        <Button type="button" variant="outline" disabled={isPending} onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create requisition'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
