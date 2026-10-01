import {
  type CreateDispatchInput,
  normalizeCreateDispatchInput,
} from '@/features/seed-dispatch/create/lib/dispatch.schema';
import type { CreateSeedDispatchInput } from '@/features/seed-dispatch/create/types';

/** `YYYY-MM-DD` becomes `YYYY-MM-DDT00:00:00.000Z`. Values that are already instants pass through. */
export function toDispatchDateIso(dateOnly: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return `${dateOnly}T00:00:00.000Z`;
  }
  return dateOnly;
}

/** Maps validated create-form values to the API POST body. */
export function toCreateSeedDispatchBody(input: CreateDispatchInput): CreateSeedDispatchInput {
  const normalized = normalizeCreateDispatchInput(input);

  return {
    toLocation: normalized.toLocation,
    truckNumber: normalized.truckNumber,
    status: 'IN_TRANSIT',
    dispatchDate: toDispatchDateIso(normalized.dispatchDate),
    ...(normalized.driverMobile ? { driverMobile: normalized.driverMobile } : {}),
    ...(normalized.manualGatePassNumber
      ? { manualGatePassNumber: normalized.manualGatePassNumber }
      : {}),
    ...(normalized.weightSlipNumber ? { weightSlipNumber: normalized.weightSlipNumber } : {}),
    ...(normalized.grossWeight != null ? { grossWeight: normalized.grossWeight } : {}),
    ...(normalized.tareWeight != null ? { tareWeight: normalized.tareWeight } : {}),
    ...(normalized.netWeight != null ? { netWeight: normalized.netWeight } : {}),
    ...(normalized.remarks ? { remarks: normalized.remarks } : {}),
    requisitions: normalized.requisitions.map((selection) => ({
      requisitionId: selection.requisitionId,
      sizeLines: selection.sizeLines.map((line) => ({
        facilityId: line.facilityId,
        sizeId: line.sizeId,
        generationId: line.generationId,
        bagQuantity: line.quantity,
      })),
    })),
  };
}
