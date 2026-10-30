import { describe, expect, it } from 'vitest';
import {
  buildFacilityStockMatrix,
  quantityForView,
  sumQuantities,
} from '@/features/master/lib/facility-stock-summary';
import type { FacilityStockSummaryVariety } from '@/features/master/types';

const stamp = {
  createdAt: '2025-04-01T00:00:00.000Z',
  updatedAt: '2025-04-02T00:00:00.000Z',
};

const summary: FacilityStockSummaryVariety[] = [
  {
    variety: { id: 'variety-1', name: 'Kufri Jyoti', ...stamp },
    initialQuantity: 300,
    currentQuantity: 240,
    sizes: [
      {
        size: {
          id: 'size-large',
          name: 'Large',
          varietyId: 'variety-1',
          seedBagsPerAcre: 10,
          ...stamp,
        },
        initialQuantity: 300,
        currentQuantity: 240,
        generations: [
          {
            generation: { id: 'gen-1', name: 'G1', ...stamp },
            initialQuantity: 200,
            currentQuantity: 150,
          },
          {
            generation: { id: 'gen-2', name: 'G2', ...stamp },
            initialQuantity: 100,
            currentQuantity: 90,
          },
        ],
      },
    ],
  },
  {
    variety: { id: 'variety-2', name: 'Atlantic', ...stamp },
    initialQuantity: 40,
    currentQuantity: 25,
    sizes: [
      {
        size: {
          id: 'size-small',
          name: 'Small',
          varietyId: 'variety-2',
          seedBagsPerAcre: 8,
          ...stamp,
        },
        initialQuantity: 40,
        currentQuantity: 25,
        generations: [
          {
            generation: { id: 'gen-2', name: 'G2', ...stamp },
            initialQuantity: 40,
            currentQuantity: 25,
          },
        ],
      },
    ],
  },
];

describe('buildFacilityStockMatrix', () => {
  it('keeps sizes and generations in first-seen order and uses size totals for All', () => {
    const matrix = buildFacilityStockMatrix(summary);

    expect(matrix.sizes).toEqual([
      { id: 'size-large', name: 'Large' },
      { id: 'size-small', name: 'Small' },
    ]);
    expect(matrix.generations).toEqual([
      { id: 'gen-1', name: 'G1' },
      { id: 'gen-2', name: 'G2' },
    ]);

    const jyoti = matrix.rows[0];
    expect(jyoti?.name).toBe('Kufri Jyoti');
    expect(quantityForView(jyoti?.cells['size-large'], 'all')).toEqual({
      initialQuantity: 300,
      currentQuantity: 240,
    });
    expect(quantityForView(jyoti?.cells['size-large'], 'gen-1')).toEqual({
      initialQuantity: 200,
      currentQuantity: 150,
    });
    expect(quantityForView(jyoti?.cells['size-small'], 'all')).toEqual({
      initialQuantity: 0,
      currentQuantity: 0,
    });
    expect(
      sumQuantities(matrix.sizes.map((size) => quantityForView(jyoti?.cells[size.id], 'all'))),
    ).toEqual({
      initialQuantity: 300,
      currentQuantity: 240,
    });

    const atlantic = matrix.rows[1];
    expect(quantityForView(atlantic?.cells['size-small'], 'gen-1')).toEqual({
      initialQuantity: 0,
      currentQuantity: 0,
    });
    expect(quantityForView(atlantic?.cells['size-small'], 'gen-2')).toEqual({
      initialQuantity: 40,
      currentQuantity: 25,
    });
  });

  it('returns an empty matrix when there is no stock', () => {
    expect(buildFacilityStockMatrix([])).toEqual({
      sizes: [],
      generations: [],
      rows: [],
    });
  });
});
