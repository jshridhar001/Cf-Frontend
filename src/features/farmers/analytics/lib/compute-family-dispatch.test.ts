import { describe, expect, it } from 'vitest';
import {
  computeFamilyDispatch,
  formatDispatchAcres,
  sortDispatchRows,
} from '@/features/farmers/analytics/lib/compute-family-dispatch';
import type { FarmerReportRequisition } from '@/features/farmers/report/types';

function requisition(
  partial: Partial<FarmerReportRequisition> & {
    farmer: FarmerReportRequisition['farmer'];
  },
): FarmerReportRequisition {
  return {
    requisitionId: partial.requisitionId ?? partial.farmer.id,
    status: 'APPROVED',
    requisitionDate: null,
    contractDate: null,
    variety: { id: 'variety', name: 'Variety' },
    quantityUnit: 'ACRES',
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

function farmer(
  id: string,
  name: string,
  family: FarmerReportRequisition['farmer']['family'] = null,
): FarmerReportRequisition['farmer'] {
  return {
    id,
    name,
    accountNumber: id,
    station: { id: 'station', name: 'Station' },
    family,
  };
}

describe('computeFamilyDispatch', () => {
  it('rolls a family into one row, keeps lone farmers, and sorts both by name', () => {
    const ajit = { id: 'fam-ajit', name: 'Ajit Singh Punia' };
    const summary = computeFamilyDispatch([
      requisition({
        farmer: farmer('chandan', 'Chandan'),
        requestedAcres: '8',
        dispatchedAcres: '0',
      }),
      requisition({
        requisitionId: 'ajit-member-a',
        farmer: farmer('member-a', 'Member A', ajit),
        requestedAcres: '10',
        dispatchedAcres: '4',
      }),
      requisition({
        requisitionId: 'ajit-member-b',
        farmer: farmer('member-b', 'Member B', ajit),
        requestedAcres: '6',
        dispatchedAcres: '2',
      }),
      requisition({
        farmer: farmer('abhi', 'Abhi Singh'),
        requestedAcres: '5',
        dispatchedAcres: '1',
      }),
      requisition({
        requisitionId: 'ajit-rejected',
        status: 'REJECTED',
        farmer: farmer('member-c', 'Member C', ajit),
        requestedAcres: '100',
        dispatchedAcres: '0',
      }),
      requisition({
        status: 'REJECTED',
        farmer: farmer('aaron', 'Aaron'),
        requestedAcres: '20',
        dispatchedAcres: '0',
      }),
    ]);

    expect(summary.rows.map((row) => row.name)).toEqual([
      'Abhi Singh',
      'Ajit Singh Punia',
      'Chandan',
    ]);
    expect(summary.rows.map((row) => row.key)).toEqual([
      'farmer:abhi',
      'family:fam-ajit',
      'farmer:chandan',
    ]);

    const ajitRow = summary.rows[1];
    expect(ajitRow).toMatchObject({
      contractedAcres: 16,
      dispatchedAcres: 6,
      remainingAcres: 10,
    });
    expect(ajitRow?.remainingAcres).toBe(
      (ajitRow?.contractedAcres ?? 0) - (ajitRow?.dispatchedAcres ?? 0),
    );

    expect(summary).toMatchObject({
      contractedAcres: 29,
      dispatchedAcres: 7,
      remainingAcres: 22,
      percent: 24,
    });
  });

  it('sums every requisition for the same lone farmer into one row', () => {
    const summary = computeFamilyDispatch([
      requisition({
        requisitionId: 'first',
        status: 'PENDING',
        farmer: farmer('abhi', 'Abhi Singh'),
        requestedAcres: '2.5',
        dispatchedAcres: '1',
      }),
      requisition({
        requisitionId: 'second',
        farmer: farmer('abhi', 'Abhi Singh'),
        requestedAcres: '1.5',
        dispatchedAcres: '0.5',
      }),
    ]);

    expect(summary.rows).toHaveLength(1);
    expect(summary.rows[0]).toMatchObject({
      key: 'farmer:abhi',
      name: 'Abhi Singh',
      contractedAcres: 4,
      dispatchedAcres: 1.5,
      remainingAcres: 2.5,
    });
  });

  it('does not treat a small over-dispatch as area still pending', () => {
    const summary = computeFamilyDispatch([
      requisition({
        farmer: farmer('gurvinder', 'Gurvinder Singh'),
        requestedAcres: '45.132',
        dispatchedAcres: '45.72',
      }),
      requisition({
        farmer: farmer('abhi', 'Abhi Singh'),
        requestedAcres: '10',
        dispatchedAcres: '4',
      }),
    ]);

    expect(summary.rows.find((row) => row.name === 'Gurvinder Singh')).toMatchObject({
      contractedAcres: 45.13,
      dispatchedAcres: 45.72,
      remainingAcres: 0,
      percent: 100,
    });
    expect(summary.remainingAcres).toBe(6);
    expect(formatDispatchAcres(45.132)).toBe('45.13');
    expect(formatDispatchAcres(10)).toBe('10');
    expect(formatDispatchAcres(19.467)).toBe('19.47');
  });

  it('re-sorts the shared list without splitting families from lone farmers', () => {
    const summary = computeFamilyDispatch([
      requisition({
        farmer: farmer('abhi', 'Abhi Singh'),
        requestedAcres: '5',
        dispatchedAcres: '1',
      }),
      requisition({
        farmer: farmer('member', 'Member', { id: 'fam-ajit', name: 'Ajit Singh Punia' }),
        requestedAcres: '10',
        dispatchedAcres: '0',
      }),
    ]);

    expect(
      sortDispatchRows(summary.rows, { key: 'name', desc: true }).map((row) => row.name),
    ).toEqual(['Ajit Singh Punia', 'Abhi Singh']);
    expect(
      sortDispatchRows(summary.rows, { key: 'remainingAcres', desc: false }).map((row) => row.name),
    ).toEqual(['Abhi Singh', 'Ajit Singh Punia']);
  });
});
