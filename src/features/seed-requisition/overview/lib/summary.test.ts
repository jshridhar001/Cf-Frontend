import { describe, expect, it } from 'vitest';
import { summarizeRequisitions } from '@/features/seed-requisition/overview/lib/summary';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';

function requisition(
  partial: Pick<SeedRequisition, 'requestedAcres' | 'requestedBags' | 'requestedDeliveries'>,
): SeedRequisition {
  return {
    id: 'req-1',
    farmerId: 'farmer-1',
    varietyId: 'variety-1',
    status: 'PENDING',
    fulfilledBags: 0,
    fulfilledAcres: '0',
    requisitionDate: null,
    engContractUrl: null,
    hindiContractUrl: null,
    remarks: null,
    createdById: 'user-1',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    farmer: null,
    variety: null,
    ...partial,
  };
}

describe('summarizeRequisitions', () => {
  it('counts approved delivery acres while the requisition is still pending', () => {
    const summary = summarizeRequisitions([
      requisition({
        requestedAcres: '40',
        requestedBags: null,
        requestedDeliveries: [
          {
            deliveryDate: '2026-10-20',
            acres: '5',
            bags: null,
            status: 'APPROVED',
            rejectionRemarks: null,
          },
          {
            deliveryDate: '2026-10-22',
            acres: '10',
            bags: null,
            status: 'PENDING',
            rejectionRemarks: null,
          },
        ],
      }),
    ]);

    expect(summary.total).toMatchObject({ count: 1, acres: 40, bags: 0 });
    expect(summary.APPROVED).toMatchObject({ count: 0, acres: 5, bags: 0 });
    expect(summary.PENDING).toMatchObject({ count: 1, acres: 35, bags: 0 });
    expect(summary.REJECTED).toMatchObject({ count: 0, acres: 0, bags: 0 });
  });
});
