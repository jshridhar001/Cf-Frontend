import { describe, expect, it } from 'vitest';
import {
  dispatchPercent,
  formatDispatchPercent,
  formatGroupDispatchPercent,
  formatMeasure,
  groupDispatch,
  groupQuantityLines,
  isComplete,
  isNothingDispatched,
  quantityLines,
  summarizeContract,
} from '@/features/farmers/report/lib/display';
import type { FarmerReportRequisition } from '@/features/farmers/report/types';

function row(
  partial: Partial<FarmerReportRequisition> & Pick<FarmerReportRequisition, 'quantityUnit'>,
): FarmerReportRequisition {
  return {
    requisitionId: 'req',
    status: 'PENDING',
    requisitionDate: null,
    contractDate: null,
    farmer: {
      id: 'farmer',
      name: 'Farmer',
      accountNumber: '1',
      station: { id: 'station', name: 'Station' },
      family: null,
    },
    variety: { id: 'variety', name: 'Variety' },
    expectedSize: null,
    requestedBags: null,
    requestedAcres: null,
    dispatchedBags: 0,
    dispatchedAcres: '0',
    remainingBags: null,
    remainingAcres: null,
    dispatchedSizes: [],
    ...partial,
  };
}

describe('contract display', () => {
  it('trims trailing zeros and keeps precise sums', () => {
    expect(formatMeasure(10)).toBe('10');
    expect(formatMeasure(10.0)).toBe('10');
    expect(formatMeasure(44.467)).toBe('44.467');
  });

  it('shows the requisition unit first and omits a missing other measure', () => {
    const acres = row({
      quantityUnit: 'ACRES',
      requestedBags: null,
      requestedAcres: '10.00',
      remainingAcres: '10',
    });
    expect(quantityLines(acres, 'requested')).toEqual({ primary: '10 ac', secondary: null });

    const bags = row({
      quantityUnit: 'BAGS',
      requestedBags: 11,
      requestedAcres: '0.256',
      remainingBags: 11,
      remainingAcres: '0.256',
    });
    expect(quantityLines(bags, 'requested')).toEqual({
      primary: '11 bags',
      secondary: '0.256 ac',
    });
  });

  it('treats zero dispatch as none yet and zero remaining as complete', () => {
    const pending = row({
      quantityUnit: 'ACRES',
      requestedAcres: '10.00',
      dispatchedBags: 0,
      dispatchedAcres: '0',
      remainingAcres: '10',
    });
    expect(isNothingDispatched(pending)).toBe(true);
    expect(isComplete(pending)).toBe(false);
    expect(dispatchPercent(pending)).toBe(0);

    const done = row({
      quantityUnit: 'BAGS',
      status: 'APPROVED',
      requestedBags: 8,
      requestedAcres: '0.211',
      dispatchedBags: 8,
      dispatchedAcres: '0.211',
      remainingBags: 0,
      remainingAcres: '0',
    });
    expect(isNothingDispatched(done)).toBe(false);
    expect(isComplete(done)).toBe(true);
    expect(formatDispatchPercent(done)).toBe('100% dispatched');
  });

  it('sums acres and bags and counts pending requisitions', () => {
    const summary = summarizeContract([
      row({
        quantityUnit: 'ACRES',
        status: 'PENDING',
        requestedAcres: '10.00',
        dispatchedAcres: '0',
      }),
      row({
        quantityUnit: 'BAGS',
        status: 'PENDING',
        requestedAcres: '0.256',
        dispatchedBags: 0,
        dispatchedAcres: '0',
      }),
      row({
        quantityUnit: 'BAGS',
        status: 'APPROVED',
        requestedAcres: '0.211',
        dispatchedBags: 8,
        dispatchedAcres: '0.211',
      }),
    ]);

    expect(summary.requisitions).toBe(3);
    expect(summary.pending).toBe(2);
    expect(formatMeasure(summary.acresRequested)).toBe('10.467');
    expect(formatMeasure(summary.acresDispatched)).toBe('0.211');
    expect(summary.bagsDispatched).toBe(8);
  });

  it('sums requested acres against dispatched acres for a group', () => {
    const rows = [
      row({
        quantityUnit: 'ACRES',
        requestedAcres: '10',
        dispatchedAcres: '2',
        requestedBags: 100,
        dispatchedBags: 20,
      }),
      row({
        quantityUnit: 'ACRES',
        requestedAcres: '10',
        dispatchedAcres: '3',
        dispatchedBags: 0,
      }),
    ];

    expect(groupDispatch(rows).percent).toBe(25);
    expect(formatGroupDispatchPercent(rows)).toBe('25% dispatched');
    expect(groupQuantityLines(rows, 'requested')).toEqual({
      primary: '20 ac',
      secondary: 'and 100 bags',
    });
    expect(groupQuantityLines(rows, 'dispatched')).toEqual({
      primary: '5 ac',
      secondary: 'or 20 bags',
    });
  });

  it('uses bags when a group has no requested acres', () => {
    const rows = [
      row({
        quantityUnit: 'BAGS',
        requestedAcres: null,
        requestedBags: 10,
        dispatchedBags: 4,
        dispatchedAcres: '0',
      }),
      row({
        quantityUnit: 'BAGS',
        requestedAcres: null,
        requestedBags: 10,
        dispatchedBags: 6,
        dispatchedAcres: '0',
      }),
    ];

    expect(groupDispatch(rows).usesAcres).toBe(false);
    expect(formatGroupDispatchPercent(rows)).toBe('50% dispatched');
    expect(groupQuantityLines(rows, 'requested').primary).toBe('20 bags');
    expect(groupQuantityLines(rows, 'dispatched').primary).toBe('10 bags');
  });
});
