import { describe, expect, it } from 'vitest';

import {
  deliveryLineForToday,
  formatDueTodayQuantity,
} from '@/features/seed-dispatch/overview/lib/awaiting-requisitions';
import type { SeedRequisitionDelivery } from '@/features/seed-requisition/overview/types';

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

describe('formatDueTodayQuantity', () => {
  it('formats acres and bags', () => {
    expect(formatDueTodayQuantity({ acres: '5.00', bags: null })).toBe('5 acres');
    expect(formatDueTodayQuantity({ acres: '1.00', bags: null })).toBe('1 acre');
    expect(formatDueTodayQuantity({ acres: null, bags: 8 })).toBe('8 bags');
    expect(formatDueTodayQuantity({ acres: null, bags: 1 })).toBe('1 bag');
    expect(formatDueTodayQuantity(null)).toBe('');
  });
});
