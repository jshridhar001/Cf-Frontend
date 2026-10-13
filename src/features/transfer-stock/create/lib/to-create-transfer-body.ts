import {
  type CreateTransferInput,
  todayDateOnly,
} from '@/features/transfer-stock/create/lib/transfer.schema';
import type { CreateStockTransferBody } from '@/features/transfer-stock/create/types';

function emptyToUndefined(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function decimalToNumber(value: string | undefined) {
  const normalized = emptyToUndefined(value);
  if (!normalized) return undefined;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** `YYYY-MM-DD` becomes `YYYY-MM-DDT00:00:00.000Z`. Values that are already instants pass through. */
export function toTransferDateIso(dateOnly: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return `${dateOnly}T00:00:00.000Z`;
  }
  return dateOnly;
}

function calculatedNet(grossWeight: number | undefined, tareWeight: number | undefined) {
  if (grossWeight == null || tareWeight == null || grossWeight < tareWeight) return undefined;
  return Number((grossWeight - tareWeight).toFixed(2));
}

export function toCreateStockTransferBody(input: CreateTransferInput): CreateStockTransferBody {
  const driverMobile = emptyToUndefined(input.driverMobile);
  const manualGatePassNumber = emptyToUndefined(input.manualGatePassNumber);
  const weightSlipNumber = emptyToUndefined(input.weightSlipNumber);
  const remarks = emptyToUndefined(input.remarks);
  const grossWeight = decimalToNumber(input.grossWeight);
  const tareWeight = decimalToNumber(input.tareWeight);
  const netWeight = calculatedNet(grossWeight, tareWeight);
  const transferDate = input.transferDate?.trim() || todayDateOnly();

  return {
    fromFarmerId: input.fromFarmerId,
    toFarmerId: input.toFarmerId,
    toLocation: input.toLocation.trim(),
    truckNumber: input.truckNumber.trim().toUpperCase(),
    transferDate: toTransferDateIso(transferDate),
    ...(driverMobile ? { driverMobile } : {}),
    ...(manualGatePassNumber ? { manualGatePassNumber } : {}),
    ...(weightSlipNumber ? { weightSlipNumber } : {}),
    ...(grossWeight != null ? { grossWeight } : {}),
    ...(tareWeight != null ? { tareWeight } : {}),
    ...(netWeight != null ? { netWeight } : {}),
    ...(remarks ? { remarks } : {}),
    lines: input.lines.map((line) => ({
      varietyId: line.varietyId,
      sizeId: line.sizeId,
      generationId: line.generationId,
      bagQuantity: line.bagQuantity,
    })),
  };
}
