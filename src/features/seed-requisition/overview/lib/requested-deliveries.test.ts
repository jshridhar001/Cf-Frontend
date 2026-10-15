import { describe, expect, it } from 'vitest';
import { validateDeliverySchedule } from '@/features/seed-requisition/overview/lib/requested-deliveries';

describe('validateDeliverySchedule', () => {
  it('allows an empty schedule and a partial acres schedule under the total', () => {
    expect(
      validateDeliverySchedule({
        quantityType: 'acres',
        total: 40,
        lines: [
          { deliveryDate: '2026-10-01', quantity: '5' },
          { deliveryDate: '2026-10-15', quantity: '8' },
        ],
      }),
    ).toEqual([]);

    expect(
      validateDeliverySchedule({
        quantityType: 'acres',
        total: 40,
        lines: [],
      }),
    ).toEqual([]);
  });

  it('keeps each line in the requisition unit', () => {
    expect(
      validateDeliverySchedule({
        quantityType: 'bags',
        total: 20,
        lines: [{ deliveryDate: '2026-10-01', quantity: '5.5' }],
      }),
    ).toEqual([
      {
        path: [0, 'quantity'],
        message: 'Enter a whole number of bags greater than 0.',
      },
    ]);
    const issues = validateDeliverySchedule({
      quantityType: 'acres',
      total: 40,
      lines: [{ deliveryDate: '2026-10-01', quantity: '5.555' }],
    });

    expect(issues).toEqual([
      {
        path: [0, 'quantity'],
        message: 'Enter acres with up to 2 decimal places.',
      },
    ]);
  });

  it('rejects duplicate dates', () => {
    const issues = validateDeliverySchedule({
      quantityType: 'bags',
      total: 20,
      lines: [
        { deliveryDate: '2026-10-01', quantity: '5' },
        { deliveryDate: '2026-10-01', quantity: '4' },
      ],
    });

    expect(issues).toEqual([
      {
        path: [1, 'deliveryDate'],
        message: 'Each delivery date can only appear once.',
      },
    ]);
  });

  it('rejects a schedule that exceeds the requested total', () => {
    const issues = validateDeliverySchedule({
      quantityType: 'acres',
      total: 10,
      lines: [
        { deliveryDate: '2026-10-01', quantity: '6' },
        { deliveryDate: '2026-10-15', quantity: '5' },
      ],
    });

    expect(issues).toEqual([
      {
        path: [],
        message: 'Scheduled quantity cannot exceed the requested total.',
      },
    ]);
  });
});
