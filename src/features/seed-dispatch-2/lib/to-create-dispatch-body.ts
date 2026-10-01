import {
  type CreateDispatchInput,
  normalizeCreateDispatchInput,
} from '@/features/seed-dispatch/schemas/dispatch.schema';
import type { CreateSeedDispatchInput } from '@/features/seed-dispatch/types';

/** Maps validated create-form values to the API POST body. */
export function toCreateSeedDispatchBody(input: CreateDispatchInput): CreateSeedDispatchInput {
  const normalized = normalizeCreateDispatchInput(input);

  return {
    toLocation: normalized.toLocation,
    truckNumber: normalized.truckNumber,
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
      lines: selection.sizeLines.map((line) => ({
        facilityId: line.facilityId,
        sizeId: line.sizeId,
        generationId: line.generationId,
        bagQuantity: line.quantity,
      })),
    })),
  };
}
