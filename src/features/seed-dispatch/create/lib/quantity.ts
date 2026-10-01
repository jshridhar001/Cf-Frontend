/** Quantity helpers for bag- vs acres-based requisitions. */

export type BagLineWithStandard = {
  quantity: number;
  bagsPerAcre: number;
};

export type QuantityRequisition = {
  acres: string | null;
  seedBagsInitialQuantity: string | null;
  fulfilledQuantity: string;
  fulfilledAcres: string;
};

const ACRES_TOLERANCE = 0.05;

export function isAcresBasedRequisition(requisition: {
  acres: string | null;
  seedBagsInitialQuantity?: string | null;
}): boolean {
  return Boolean(requisition.acres && Number.parseFloat(requisition.acres) > 0);
}

export function parseDecimal(value: string | null | undefined): number {
  if (value == null || value === '') return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getRemainingBags(requisition: QuantityRequisition): number {
  const initial = parseDecimal(requisition.seedBagsInitialQuantity);
  const fulfilled = parseDecimal(requisition.fulfilledQuantity);
  return Math.max(0, roundBags(initial - fulfilled));
}

export function getRemainingAcres(requisition: QuantityRequisition): number {
  const initial = parseDecimal(requisition.acres);
  const fulfilled = parseDecimal(requisition.fulfilledAcres);
  return Math.max(0, round2(initial - fulfilled));
}

export function acresFromBags(quantity: number, bagsPerAcre: number): number {
  if (bagsPerAcre <= 0) return 0;
  return round2(quantity / bagsPerAcre);
}

export function sumAcresFromBagLines(lines: BagLineWithStandard[]): number {
  return round2(
    lines.reduce((sum, line) => sum + acresFromBags(line.quantity, line.bagsPerAcre), 0),
  );
}

export function getAcresConsumedByOtherLines(lines: BagLineWithStandard[]): number {
  return sumAcresFromBagLines(lines);
}

export function getAvailableAcresForLine(remainingAcres: number, otherAcres: number): number {
  return Math.max(0, round2(remainingAcres - otherAcres));
}

/** Whole bags only; half-up (.5+ rounds up). */
export function roundBags(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value);
}

export function getMaxBagsForAvailableAcres(availableAcres: number, bagsPerAcre: number): number {
  if (bagsPerAcre <= 0 || availableAcres <= 0) return 0;
  return roundBags(availableAcres * bagsPerAcre);
}

/**
 * Half-up whole bags can slightly overshoot remaining acres.
 * Allow that overshoot (remaining floors at 0) — do not treat as an error.
 * Reject only clear excess beyond half a bag at 1 bag/acre.
 */
const BAG_ROUNDING_ACRES_OVERSHOOT = 0.5;

export function isAcresDispatchWithinTolerance(
  consumedAcres: number,
  remainingAcres: number,
): boolean {
  if (consumedAcres <= remainingAcres + ACRES_TOLERANCE) return true;
  const overshoot = round2(consumedAcres - remainingAcres);
  return overshoot > 0 && overshoot <= BAG_ROUNDING_ACRES_OVERSHOOT;
}

/** Remaining acres after a dispatch — never negative. */
export function remainingAcresAfterConsume(remainingAcres: number, consumedAcres: number): number {
  return Math.max(0, round2(remainingAcres - consumedAcres));
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatDecimal(value: number): string {
  return String(round2(value));
}
