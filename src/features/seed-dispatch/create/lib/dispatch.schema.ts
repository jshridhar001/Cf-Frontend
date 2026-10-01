import { z } from 'zod';

import { formatDecimal, round2 } from '@/features/seed-dispatch/create/lib/quantity';

const optionalDecimal = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(
    (value) => !value || /^\d+(\.\d{1,2})?$/.test(value),
    'Enter a valid number with up to 2 decimal places',
  );

const requiredPositiveInteger = z
  .string()
  .trim()
  .min(1, 'Quantity is required')
  .refine((value) => /^\d+$/.test(value), 'Enter a whole number of bags')
  .refine((value) => Number.parseInt(value, 10) > 0, 'Quantity must be greater than 0');

const optionalString = z.string().trim().optional().or(z.literal(''));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Enter a valid date');

export const dispatchSizeLineSchema = z.object({
  facilityId: z.string().min(1, 'Facility is required'),
  sizeId: z.string().min(1, 'Seed Size is required'),
  generationId: z.string().min(1, 'Generation is required'),
  quantity: requiredPositiveInteger,
});

export const dispatchRequisitionSelectionSchema = z.object({
  requisitionId: z.string().min(1, 'Requisition is required'),
  sizeLines: z
    .array(dispatchSizeLineSchema)
    .min(1, 'At least one Seed Size line is required')
    .superRefine((lines, ctx) => {
      const keys = lines.map((line) => `${line.facilityId}:${line.sizeId}:${line.generationId}`);
      if (new Set(keys).size !== keys.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate facility, size, and generation combinations are not allowed',
        });
      }
    }),
});

export const createDispatchSchema = z.object({
  requisitions: z
    .array(dispatchRequisitionSelectionSchema)
    .min(1, 'Select at least one requisition'),
  dispatchDate: optionalDate,
  toLocation: z.string().trim().min(1, 'Destination is required'),
  truckNumber: z
    .string()
    .trim()
    .min(1, 'Truck number is required')
    .transform((value) => value.toUpperCase()),
  manualGatePassNumber: optionalString,
  weightSlipNumber: optionalString,
  driverMobile: optionalString,
  grossWeight: optionalDecimal,
  tareWeight: optionalDecimal,
  netWeight: optionalDecimal,
  averageWeightPerBag: optionalDecimal,
  remarks: optionalString,
});

export const dispatchCreateStep2Schema = createDispatchSchema.omit({
  requisitions: true,
});

export type DispatchSizeLineInput = z.infer<typeof dispatchSizeLineSchema>;
export type DispatchRequisitionSelectionInput = z.infer<typeof dispatchRequisitionSelectionSchema>;
export type CreateDispatchInput = z.infer<typeof createDispatchSchema>;
export type DispatchCreateStep2Input = z.infer<typeof dispatchCreateStep2Schema>;

export function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const emptyDispatchCreateStep2Values: DispatchCreateStep2Input = {
  dispatchDate: todayDateOnly(),
  toLocation: '',
  truckNumber: '',
  manualGatePassNumber: '',
  weightSlipNumber: '',
  driverMobile: '',
  grossWeight: '',
  tareWeight: '',
  netWeight: '',
  averageWeightPerBag: '',
  remarks: '',
};

function emptyToUndefined(value: string | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

function decimalToNumber(value: string | undefined) {
  const normalized = emptyToUndefined(value);
  return normalized ? Number.parseFloat(normalized) : undefined;
}

export function totalBagsFromSelections(
  requisitions: Array<{ sizeLines: Array<{ quantity: string | number }> }>,
): number {
  return round2(
    requisitions.reduce(
      (sum, selection) =>
        sum +
        selection.sizeLines.reduce((lineSum, line) => {
          const qty =
            typeof line.quantity === 'number' ? line.quantity : Number.parseFloat(line.quantity);
          return lineSum + (Number.isFinite(qty) ? qty : 0);
        }, 0),
      0,
    ),
  );
}

export function bagsByFacilityFromSelections(
  requisitions: Array<{
    sizeLines: Array<{ facilityId: string; quantity: string | number }>;
  }>,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const selection of requisitions) {
    for (const line of selection.sizeLines) {
      const qty =
        typeof line.quantity === 'number' ? line.quantity : Number.parseFloat(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      totals.set(line.facilityId, round2((totals.get(line.facilityId) ?? 0) + qty));
    }
  }
  return totals;
}

export function normalizeCreateDispatchInput(input: CreateDispatchInput) {
  const dispatchDate = input.dispatchDate?.trim() || new Date().toISOString().slice(0, 10);

  const requisitions = input.requisitions.map((selection) => ({
    requisitionId: selection.requisitionId,
    sizeLines: selection.sizeLines.map((line) => ({
      facilityId: line.facilityId,
      sizeId: line.sizeId,
      generationId: line.generationId,
      quantity: Number.parseFloat(line.quantity),
    })),
  }));

  const totalBags = totalBagsFromSelections(requisitions);
  const facilityBagTotals = bagsByFacilityFromSelections(requisitions);
  const grossWeight = decimalToNumber(input.grossWeight);
  const tareWeight = decimalToNumber(input.tareWeight);

  let netWeight = decimalToNumber(input.netWeight);
  let averageWeightPerBag = decimalToNumber(input.averageWeightPerBag);

  if (grossWeight != null && tareWeight != null) {
    netWeight = round2(grossWeight - tareWeight);
    if (totalBags > 0 && netWeight >= 0) {
      averageWeightPerBag = round2(netWeight / totalBags);
    }
  }

  return {
    dispatchDate,
    toLocation: input.toLocation.trim(),
    truckNumber: input.truckNumber.trim().toUpperCase(),
    manualGatePassNumber: emptyToUndefined(input.manualGatePassNumber),
    weightSlipNumber: emptyToUndefined(input.weightSlipNumber),
    driverMobile: emptyToUndefined(input.driverMobile),
    grossWeight,
    tareWeight,
    netWeight,
    averageWeightPerBag,
    remarks: emptyToUndefined(input.remarks),
    requisitions,
    totalBags,
    facilityBagTotals,
  };
}

export type NormalizedCreateDispatchInput = ReturnType<typeof normalizeCreateDispatchInput>;

export { formatDecimal };
