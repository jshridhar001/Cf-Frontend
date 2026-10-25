import { SQUARE_METERS_PER_ACRE } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/geo-metrics';
import type { StripTest } from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';

/** Yield bags match the 50 kg planting bag used in the seed contract. */
export const BAG_KG = 50;

export type StripSizeShare = {
  tuberSizeId: string;
  name: string;
  quantity: number;
  weightKg: number;
  sharePct: number;
};

export type StripTestSummary = {
  areaM2: number;
  sizeSegmentCount: number;
  totalTubers: number;
  totalWeightKg: number;
  sizes: StripSizeShare[];
  kgPerM2: number | null;
  kgPerAcre: number | null;
  bagsPerAcre: number | null;
  expectedKg: number | null;
  expectedBags: number | null;
};

function finiteMeasure(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function positiveMeasure(value: number | string | null | undefined) {
  const amount = finiteMeasure(value);
  return amount > 0 ? amount : null;
}

export function stripAreaSquareMeters(length: number | string, width: number | string) {
  const lengthM = positiveMeasure(length);
  const widthM = positiveMeasure(width);
  if (lengthM == null || widthM == null) return 0;
  return lengthM * widthM;
}

export function summarizeStripTests(
  strips: Array<Pick<StripTest, 'stripLength' | 'stripWidth' | 'tuberRecords'>>,
  fieldAcres: number | string | null | undefined,
): StripTestSummary {
  const areaM2 = strips.reduce(
    (total, strip) => total + stripAreaSquareMeters(strip.stripLength, strip.stripWidth),
    0,
  );
  const sizesById = new Map<string, Omit<StripSizeShare, 'sharePct'>>();
  let totalTubers = 0;
  let totalWeightKg = 0;

  for (const strip of strips) {
    for (const record of strip.tuberRecords) {
      const quantity = finiteMeasure(record.quantity);
      const weightKg = finiteMeasure(record.weightKg);
      totalTubers += quantity;
      totalWeightKg += weightKg;

      const existing = sizesById.get(record.tuberSizeId);
      if (existing) {
        existing.quantity += quantity;
        existing.weightKg += weightKg;
        continue;
      }

      sizesById.set(record.tuberSizeId, {
        tuberSizeId: record.tuberSizeId,
        name: record.tuberSize?.name?.trim() || 'Tuber',
        quantity,
        weightKg,
      });
    }
  }

  const sizes = [...sizesById.values()].map((size) => ({
    ...size,
    sharePct: totalWeightKg > 0 ? (size.weightKg / totalWeightKg) * 100 : 0,
  }));
  const kgPerM2 = areaM2 > 0 && totalWeightKg > 0 ? totalWeightKg / areaM2 : null;
  const kgPerAcre = kgPerM2 == null ? null : kgPerM2 * SQUARE_METERS_PER_ACRE;
  const bagsPerAcre = kgPerAcre == null ? null : kgPerAcre / BAG_KG;
  const acres = positiveMeasure(fieldAcres);

  return {
    areaM2,
    sizeSegmentCount: sizes.length,
    totalTubers,
    totalWeightKg,
    sizes,
    kgPerM2,
    kgPerAcre,
    bagsPerAcre,
    expectedKg: kgPerAcre == null || acres == null ? null : kgPerAcre * acres,
    expectedBags: bagsPerAcre == null || acres == null ? null : bagsPerAcre * acres,
  };
}
