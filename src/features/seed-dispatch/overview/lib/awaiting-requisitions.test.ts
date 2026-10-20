import { describe, expect, it } from 'vitest';

import {
  buildAwaitingLots,
  deliveryLineForToday,
  formatDueTodayQuantity,
  partitionDeliveryLots,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';
import type {
  SeedRequisition,
  SeedRequisitionDelivery,
} from '@/features/seed-requisition/overview/types';

const today = new Date(2026, 9, 14);

const lines: SeedRequisitionDelivery[] = [
  {
    deliveryDate: '2026-10-01T00:00:00.000Z',
    acres: '5.00',
    bags: null,
    status: 'APPROVED',
    rejectionRemarks: null,
  },
  {
    deliveryDate: '2026-10-14T00:00:00.000Z',
    acres: '8.00',
    bags: null,
    status: 'APPROVED',
    rejectionRemarks: null,
  },
];

describe('deliveryLineForToday', () => {
  it('returns the line whose UTC calendar day matches local today', () => {
    expect(deliveryLineForToday(lines, today)).toEqual(lines[1]);
  });

  it('returns null when no line is dated today', () => {
    expect(deliveryLineForToday(lines, new Date(2026, 9, 15))).toBeNull();
  });

  it('returns the single bags line for today', () => {
    const bagsLines: SeedRequisitionDelivery[] = [
      {
        deliveryDate: '2026-10-14T00:00:00.000Z',
        acres: null,
        bags: 8,
        status: 'APPROVED',
        rejectionRemarks: null,
      },
    ];
    expect(deliveryLineForToday(bagsLines, today)?.bags).toBe(8);
  });

  it('ignores a pending line dated today', () => {
    const pending: SeedRequisitionDelivery[] = [
      {
        deliveryDate: '2026-10-14T00:00:00.000Z',
        acres: '5.00',
        bags: null,
        status: 'PENDING',
        rejectionRemarks: null,
      },
    ];
    expect(deliveryLineForToday(pending, today)).toBeNull();
  });
});

function requisition(deliveries: SeedRequisitionDelivery[], id = 'req-1'): SeedRequisition {
  return {
    id,
    farmerId: 'farmer-1',
    varietyId: 'variety-1',
    status: 'APPROVED',
    requestedBags: null,
    requestedAcres: null,
    fulfilledBags: 0,
    fulfilledAcres: '0',
    requisitionDate: '2026-10-01',
    engContractUrl: null,
    hindiContractUrl: null,
    requestedDeliveries: deliveries,
    remarks: null,
    createdById: 'user-1',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    farmer: { name: 'Aman Singh', accountNumber: '1042' },
    variety: { name: 'Kufri Jyoti' },
  };
}

function dispatchFor(deliveryId: string, bags: number, status = 'IN_TRANSIT'): SeedDispatch {
  return {
    status,
    dispatchRequisitions: [
      {
        deliveryId,
        sizeLines: [{ bagQuantity: bags, size: { seedBagsPerAcre: null } }],
      },
    ],
  } as SeedDispatch;
}

describe('buildAwaitingLots', () => {
  it('keeps approved deliveries with quantity left and fully dispatched deliveries', () => {
    const lots = buildAwaitingLots(
      [
        requisition([
          {
            id: 'del-open',
            deliveryDate: '2026-10-14T00:00:00.000Z',
            acres: null,
            bags: 10,
            status: 'APPROVED',
            rejectionRemarks: null,
          },
          {
            id: 'del-done',
            deliveryDate: '2026-10-15T00:00:00.000Z',
            acres: null,
            bags: 8,
            status: 'APPROVED',
            rejectionRemarks: null,
          },
          {
            id: 'del-pending',
            deliveryDate: '2026-10-16T00:00:00.000Z',
            acres: null,
            bags: 4,
            status: 'PENDING',
            rejectionRemarks: null,
          },
        ]),
      ],
      [dispatchFor('del-done', 8), dispatchFor('del-open', 3, 'NULL')],
    );

    expect(lots.map((lot) => [lot.id, lot.remainingQuantity])).toEqual([
      ['del-open', 10],
      ['del-done', 0],
    ]);
    expect(partitionDeliveryLots(lots)).toMatchObject({
      active: [{ id: 'del-open' }],
      fulfilled: [{ id: 'del-done' }],
    });
  });
});

describe('formatDueTodayQuantity', () => {
  it('formats acres and bags', () => {
    expect(formatDueTodayQuantity({ acres: '5.00', bags: null })).toBe('5 acres');
    expect(formatDueTodayQuantity({ acres: '1.00', bags: null })).toBe('1 acre');
    expect(formatDueTodayQuantity({ acres: null, bags: 8 })).toBe('8 bags');
    expect(formatDueTodayQuantity({ acres: null, bags: 1 })).toBe('1 bag');
    expect(formatDueTodayQuantity(null)).toBe('');
  });
});
