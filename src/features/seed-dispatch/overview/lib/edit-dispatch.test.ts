import { describe, expect, it } from 'vitest';
import {
  editSeedDispatchDefaultValues,
  editSeedDispatchSchema,
  toDateOnlyPrefix,
  toUpdateSeedDispatchBody,
} from '@/features/seed-dispatch/overview/lib/edit-dispatch';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';

const dispatch = {
  id: '3f1c2a40-7b6e-4d11-9a2c-8e5f0b1d6c77',
  toLocation: 'Jalandhar',
  status: 'IN_TRANSIT',
  dispatchDate: '2026-10-30T00:00:00.000Z',
  truckNumber: 'pb10ab1234',
  driverMobile: '9876543210',
  manualGatePassNumber: 'GP-2026-0142',
  weightSlipNumber: 'WS-2026-0142',
  grossWeight: '1200.00',
  tareWeight: '400.00',
  netWeight: '800.00',
  remarks: 'Corrected weighbridge slip',
  createdById: 'user-id',
  createdAt: '2026-09-20T00:00:00.000Z',
  updatedAt: '2026-10-30T09:30:00.000Z',
  dispatchRequisitions: [],
} satisfies SeedDispatch;

describe('edit seed dispatch payload', () => {
  it('keeps the calendar day from a UTC midnight instant', () => {
    expect(toDateOnlyPrefix('2026-10-30T00:00:00.000Z')).toBe('2026-10-30');
    expect(toDateOnlyPrefix(null)).toBe('');
  });

  it('maps form values to the PUT body and clears blank optional fields', () => {
    const values = editSeedDispatchDefaultValues(dispatch);
    expect(values.dispatchDate).toBe('2026-10-30');

    expect(
      toUpdateSeedDispatchBody({
        ...values,
        truckNumber: ' pb10ab1234 ',
        driverMobile: ' ',
        remarks: '',
      }),
    ).toEqual({
      dispatchDate: '2026-10-30T00:00:00.000Z',
      truckNumber: 'PB10AB1234',
      manualGatePassNumber: 'GP-2026-0142',
      driverMobile: null,
      toLocation: 'Jalandhar',
      weightSlipNumber: 'WS-2026-0142',
      grossWeight: 1200,
      tareWeight: 400,
      remarks: null,
    });
  });

  it('rejects tare weight greater than gross weight', () => {
    const result = editSeedDispatchSchema.safeParse({
      ...editSeedDispatchDefaultValues(dispatch),
      grossWeight: '400',
      tareWeight: '500',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'tareWeight')).toBe(true);
    }
  });
});
