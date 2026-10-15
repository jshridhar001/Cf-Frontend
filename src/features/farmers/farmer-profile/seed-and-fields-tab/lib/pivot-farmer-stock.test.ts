import { describe, expect, it } from 'vitest';
import { pivotFarmerStock } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/pivot-farmer-stock';
import type { FarmerStockRow } from '@/features/transfer-stock/create/types';

function row(
  partial: Pick<FarmerStockRow, 'varietyId' | 'sizeId' | 'generationId' | 'balance'> & {
    varietyName: string;
    sizeName: string;
    generationName?: string;
  },
): FarmerStockRow {
  return {
    id: `${partial.varietyId}-${partial.sizeId}-${partial.generationId}`,
    farmerId: 'farmer-1',
    varietyId: partial.varietyId,
    sizeId: partial.sizeId,
    generationId: partial.generationId,
    balance: partial.balance,
    variety: { id: partial.varietyId, name: partial.varietyName },
    size: { id: partial.sizeId, name: partial.sizeName },
    generation: { id: partial.generationId, name: partial.generationName ?? 'G1' },
  };
}

describe('pivotFarmerStock', () => {
  it('sums generations into variety rows and size columns', () => {
    const summary = pivotFarmerStock([
      row({
        varietyId: 'chipsona',
        varietyName: 'Chipsona 1',
        sizeId: 'goli-c',
        sizeName: 'Goli',
        generationId: 'g1',
        balance: '1000',
      }),
      row({
        varietyId: 'chipsona',
        varietyName: 'Chipsona 1',
        sizeId: 'goli-c',
        sizeName: 'Goli',
        generationId: 'g2',
        balance: '150.9',
      }),
      row({
        varietyId: 'chipsona',
        varietyName: 'Chipsona 1',
        sizeId: 'seed-c',
        sizeName: 'Seed',
        generationId: 'g1',
        balance: '270',
      }),
      row({
        varietyId: 'atlantic',
        varietyName: 'Atlantic',
        sizeId: 'keri-a',
        sizeName: 'Keri',
        generationId: 'g1',
        balance: '200',
      }),
      row({
        varietyId: 'atlantic',
        varietyName: 'Atlantic',
        sizeId: 'number-a',
        sizeName: 'Number-12',
        generationId: 'g1',
        balance: '0',
      }),
    ]);

    expect(summary.sizes.map((size) => size.name)).toEqual(['Goli', 'Keri', 'Seed', 'Number-12']);
    expect(summary.rows.map((variety) => variety.varietyName)).toEqual(['Atlantic', 'Chipsona 1']);
    expect(summary.rows[1]?.bagsBySizeKey).toEqual({ goli: 1150, seed: 270 });
    expect(summary.rows[1]?.total).toBe(1420);
    expect(summary.rows[0]?.bagsBySizeKey.keri).toBe(200);
    expect(summary.rows[0]?.bagsBySizeKey['number-12']).toBe(0);
    expect(summary.columnTotals).toEqual({ goli: 1150, keri: 200, seed: 270, 'number-12': 0 });
    expect(summary.grandTotal).toBe(1620);
  });

  it('appends unknown sizes after the preferred order', () => {
    const summary = pivotFarmerStock([
      row({
        varietyId: 'v',
        varietyName: 'Atlantic',
        sizeId: 's1',
        sizeName: 'Baby',
        generationId: 'g1',
        balance: '4',
      }),
      row({
        varietyId: 'v',
        varietyName: 'Atlantic',
        sizeId: 's2',
        sizeName: 'Ration',
        generationId: 'g1',
        balance: '6',
      }),
    ]);

    expect(summary.sizes.map((size) => size.name)).toEqual(['Ration', 'Baby']);
  });
});
