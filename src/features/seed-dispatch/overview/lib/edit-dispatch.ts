import { z } from 'zod';
import { dispatchCreateStep2Schema } from '@/features/seed-dispatch/create/lib/dispatch.schema';
import { toDispatchDateIso } from '@/features/seed-dispatch/create/lib/to-create-dispatch-body';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';

const requiredDate = z
  .string()
  .trim()
  .min(1, 'Dispatch date is required')
  .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), 'Enter a valid date');

const optionalText = z.string().trim();

const optionalDecimalText = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^\d+(\.\d{1,2})?$/.test(value),
    'Enter a valid number with up to 2 decimal places',
  );

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

function decimalToNumberOrNull(value: string | null | undefined): number | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export const editSeedDispatchSchema = dispatchCreateStep2Schema
  .omit({ netWeight: true, averageWeightPerBag: true })
  .extend({
    dispatchDate: requiredDate,
    manualGatePassNumber: optionalText,
    weightSlipNumber: optionalText,
    driverMobile: optionalText,
    remarks: optionalText,
    grossWeight: optionalDecimalText,
    tareWeight: optionalDecimalText,
  })
  .superRefine((value, ctx) => {
    const gross = decimalToNumberOrNull(value.grossWeight);
    const tare = decimalToNumberOrNull(value.tareWeight);
    if (gross == null || tare == null) return;
    if (tare > gross) {
      ctx.addIssue({
        code: 'custom',
        message: 'Tare weight cannot be greater than gross weight',
        path: ['tareWeight'],
      });
    }
  });

export type EditSeedDispatchFormValues = {
  dispatchDate: string;
  toLocation: string;
  truckNumber: string;
  manualGatePassNumber: string;
  weightSlipNumber: string;
  driverMobile: string;
  grossWeight: string;
  tareWeight: string;
  remarks: string;
};

export type UpdateSeedDispatchBody = {
  dispatchDate: string;
  truckNumber: string;
  manualGatePassNumber: string | null;
  driverMobile: string | null;
  toLocation: string;
  weightSlipNumber: string | null;
  grossWeight: number | null;
  tareWeight: number | null;
  remarks: string | null;
};

/** Keeps the calendar day from an ISO instant (`2026-10-30T00:00:00.000Z` → `2026-10-30`). */
export function toDateOnlyPrefix(value: string | null | undefined): string {
  if (!value) return '';
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match?.[1] ?? '';
}

export function editSeedDispatchDefaultValues(dispatch: SeedDispatch): EditSeedDispatchFormValues {
  return {
    dispatchDate: toDateOnlyPrefix(dispatch.dispatchDate),
    toLocation: dispatch.toLocation ?? '',
    truckNumber: dispatch.truckNumber ?? '',
    manualGatePassNumber: dispatch.manualGatePassNumber ?? '',
    weightSlipNumber: dispatch.weightSlipNumber ?? '',
    driverMobile: dispatch.driverMobile ?? '',
    grossWeight: dispatch.grossWeight ?? '',
    tareWeight: dispatch.tareWeight ?? '',
    remarks: dispatch.remarks ?? '',
  };
}

export function toUpdateSeedDispatchBody(
  value: EditSeedDispatchFormValues,
): UpdateSeedDispatchBody {
  return {
    dispatchDate: toDispatchDateIso(value.dispatchDate.trim()),
    truckNumber: value.truckNumber.trim().toUpperCase(),
    toLocation: value.toLocation.trim(),
    manualGatePassNumber: emptyToNull(value.manualGatePassNumber),
    driverMobile: emptyToNull(value.driverMobile),
    weightSlipNumber: emptyToNull(value.weightSlipNumber),
    grossWeight: decimalToNumberOrNull(value.grossWeight),
    tareWeight: decimalToNumberOrNull(value.tareWeight),
    remarks: emptyToNull(value.remarks),
  };
}
