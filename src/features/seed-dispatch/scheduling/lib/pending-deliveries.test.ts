import { describe, expect, it } from 'vitest';
import {
  buildPendingDeliveryLines,
  filterPendingLines,
  formatDateGroupSummary,
  groupPendingDeliveriesByDate,
  summarizePendingLines,
} from '@/features/seed-dispatch/scheduling/lib/pending-deliveries';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';

function requisition(
  overrides: Partial<SeedRequisition> & Pick<SeedRequisition, 'id' | 'requestedDeliveries'>,
): SeedRequisition {
  return {
    farmerId: 'farmer-1',
    varietyId: 'variety-1',
    expectedSizeId: null,
    status: 'PENDING',
    requestedBags: null,
    requestedAcres: null,
    fulfilledBags: 0,
    fulfilledAcres: '0',
    requisitionDate: '2026-10-01',
    engContractUrl: null,
    hindiContractUrl: null,
    remarks: null,
    createdById: 'user-1',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    farmer: {
      name: 'Aman Singh',
      accountNumber: '1042',
      station: { name: 'Rampur' },
    },
    variety: { name: 'Kufri Jyoti' },
    expectedSize: null,
    ...overrides,
  };
}

describe('buildPendingDeliveryLines', () => {
  it('keeps pending deliveries with a quantity and skips approved, rejected, and empty lines', () => {
    const lines = buildPendingDeliveryLines([
      requisition({
        id: 'req-1',
        remarks: 'dry before load',
        requestedDeliveries: [
          {
            id: 'del-approved',
            deliveryDate: '2026-10-20T00:00:00.000Z',
            acres: null,
            bags: 100,
            status: 'APPROVED',
            rejectionRemarks: null,
          },
          {
            id: 'del-rejected',
            deliveryDate: '2026-10-21T00:00:00.000Z',
            acres: null,
            bags: 80,
            status: 'REJECTED',
            rejectionRemarks: 'no stock',
          },
          {
            id: 'del-empty',
            deliveryDate: '2026-10-22T00:00:00.000Z',
            acres: null,
            bags: 0,
            status: 'PENDING',
            rejectionRemarks: null,
          },
          {
            id: 'del-bags',
            deliveryDate: '2026-10-18T00:00:00.000Z',
            acres: null,
            bags: 240,
            status: 'PENDING',
            rejectionRemarks: null,
          },
          {
            deliveryDate: '2026-10-18',
            acres: '2.50',
            bags: 40,
            status: 'PENDING',
            rejectionRemarks: null,
          },
        ],
      }),
    ]);

    expect(lines.map((line) => line.id)).toEqual(['del-bags', 'req-1:2026-10-18:4']);
    expect(lines[0]).toMatchObject({
      bags: 240,
      acres: 0,
      isAcresBased: false,
      stationName: 'Rampur',
      varietyName: 'Kufri Jyoti',
      accountNumber: '1042',
      deliveryDate: '2026-10-18',
      remarks: 'dry before load',
    });
    expect(lines[1]).toMatchObject({
      isAcresBased: true,
      bags: 0,
      acres: 2.5,
    });
  });
});

describe('groupPendingDeliveriesByDate', () => {
  const lines = buildPendingDeliveryLines([
    requisition({
      id: 'req-late',
      farmer: { name: 'Zara Khan', accountNumber: '9', station: { name: 'Rampur' } },
      requestedDeliveries: [
        {
          id: 'late',
          deliveryDate: '2026-10-20',
          acres: null,
          bags: 700,
          status: 'PENDING',
          rejectionRemarks: null,
        },
      ],
    }),
    requisition({
      id: 'req-early',
      farmer: { name: 'Aman Singh', accountNumber: '1', station: { name: 'Sadar' } },
      varietyId: 'variety-2',
      variety: { name: 'Chipsona' },
      requestedDeliveries: [
        {
          id: 'early-b',
          deliveryDate: '2026-10-18',
          acres: null,
          bags: 200,
          status: 'PENDING',
          rejectionRemarks: null,
        },
      ],
    }),
    requisition({
      id: 'req-early-2',
      farmer: { name: 'Bina Devi', accountNumber: '2', station: { name: 'Sadar' } },
      requestedDeliveries: [
        {
          id: 'early-a',
          deliveryDate: '2026-10-18',
          acres: '1.00',
          bags: null,
          status: 'PENDING',
          rejectionRemarks: null,
        },
      ],
    }),
  ]);

  it('groups by requested date', () => {
    const groups = groupPendingDeliveriesByDate(lines);

    expect(groups.map((group) => group.date)).toEqual(['2026-10-18', '2026-10-20']);
    expect(groups[0].lines.map((line) => line.farmerName)).toEqual(['Aman Singh', 'Bina Devi']);
    expect(groups[0]).toMatchObject({ bags: 200, acres: 1 });
    expect(formatDateGroupSummary(groups[0])).toBe('2 requests · 200 bags · 1 acre');
    expect(summarizePendingLines(lines)).toEqual({
      count: 3,
      bags: 900,
      acres: 1,
      dateCount: 2,
    });
  });

  it('filters by search, date, variety, and station', () => {
    expect(
      filterPendingLines(lines, {
        query: 'bina',
        date: '',
        varietyId: '',
        station: '',
      }).map((line) => line.id),
    ).toEqual(['early-a']);

    expect(
      filterPendingLines(lines, {
        query: '',
        date: '2026-10-18',
        varietyId: 'variety-2',
        station: 'Sadar',
      }).map((line) => line.id),
    ).toEqual(['early-b']);
  });
});
