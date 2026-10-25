import { describe, expect, it } from 'vitest';
import { SQUARE_METERS_PER_ACRE } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/geo-metrics';
import {
  BAG_KG,
  stripAreaSquareMeters,
  summarizeStripTests,
} from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-summary';
import type { StripTestTuberRecord } from '@/features/farmers/farmer-profile/seed-and-fields-tab/strip-test-types';

function record(
  tuberSizeId: string,
  name: string,
  quantity: number,
  weightKg: string,
): StripTestTuberRecord {
  return {
    id: tuberSizeId,
    stripTestId: 'strip',
    tuberSizeId,
    quantity,
    weightKg,
    tuberSize: { id: tuberSizeId, name },
  };
}

describe('summarizeStripTests', () => {
  it('pools strip area and merges the same tuber size', () => {
    const summary = summarizeStripTests(
      [
        {
          stripLength: '10',
          stripWidth: '2',
          tuberRecords: [record('seed', 'Seed', 40, '60'), record('chat', 'Chat', 20, '40')],
        },
        {
          stripLength: '5',
          stripWidth: '2',
          tuberRecords: [record('seed', 'Seed', 10, '15')],
        },
      ],
      '2',
    );

    expect(summary.areaM2).toBe(30);
    expect(summary.sizeSegmentCount).toBe(2);
    expect(summary.totalTubers).toBe(70);
    expect(summary.totalWeightKg).toBe(115);
    expect(summary.sizes[0]).toMatchObject({
      tuberSizeId: 'seed',
      quantity: 50,
      weightKg: 75,
      sharePct: (75 / 115) * 100,
    });
    expect(summary.sizes[1]?.sharePct).toBeCloseTo((40 / 115) * 100);

    const kgPerM2 = 115 / 30;
    expect(summary.kgPerM2).toBeCloseTo(kgPerM2);
    expect(summary.kgPerAcre).toBeCloseTo(kgPerM2 * SQUARE_METERS_PER_ACRE);
    expect(summary.bagsPerAcre).toBeCloseTo((kgPerM2 * SQUARE_METERS_PER_ACRE) / BAG_KG);
    expect(summary.expectedKg).toBeCloseTo(kgPerM2 * SQUARE_METERS_PER_ACRE * 2);
    expect(summary.expectedBags).toBeCloseTo(((kgPerM2 * SQUARE_METERS_PER_ACRE) / BAG_KG) * 2);
  });

  it('leaves yield blank when area, weight, or field acres is missing', () => {
    const weighed = summarizeStripTests(
      [{ stripLength: '0', stripWidth: '2', tuberRecords: [record('seed', 'Seed', 4, '10')] }],
      '1.5',
    );
    expect(stripAreaSquareMeters('0', '2')).toBe(0);
    expect(weighed.bagsPerAcre).toBeNull();
    expect(weighed.expectedBags).toBeNull();

    const unweighed = summarizeStripTests(
      [{ stripLength: '4', stripWidth: '1', tuberRecords: [record('seed', 'Seed', 4, '0')] }],
      '1.5',
    );
    expect(unweighed.areaM2).toBe(4);
    expect(unweighed.bagsPerAcre).toBeNull();

    const noField = summarizeStripTests(
      [{ stripLength: '4', stripWidth: '1', tuberRecords: [record('seed', 'Seed', 4, '10')] }],
      '0',
    );
    expect(noField.bagsPerAcre).not.toBeNull();
    expect(noField.expectedBags).toBeNull();
    expect(noField.expectedKg).toBeNull();
  });
});
