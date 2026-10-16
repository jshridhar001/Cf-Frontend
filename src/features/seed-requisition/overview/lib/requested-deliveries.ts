import {
  formatRequisitionDate,
  type SeedRequisitionDelivery,
} from '@/features/seed-requisition/overview/types';

const ACRES_MAX_DECIMALS = 2;

export type DeliveryScheduleLine = {
  deliveryDate: string;
  quantity: string;
};

export type DeliveryScheduleIssue = {
  path: (string | number)[];
  message: string;
};

function acresHasAtMostDecimals(value: string, maxDecimals: number): boolean {
  const fraction = value.trim().split('.')[1];
  return !fraction || fraction.length <= maxDecimals;
}

export function validateDeliverySchedule(input: {
  quantityType: 'bags' | 'acres';
  total: number;
  lines: DeliveryScheduleLine[];
}): DeliveryScheduleIssue[] {
  const issues: DeliveryScheduleIssue[] = [];
  const dates = new Set<string>();
  let scheduled = 0;

  input.lines.forEach((line, index) => {
    const date = line.deliveryDate.trim();
    const quantityText = line.quantity.trim();
    if (!date && !quantityText) return;

    if (!date) {
      issues.push({
        path: [index, 'deliveryDate'],
        message: 'Select a delivery date.',
      });
    } else if (dates.has(date)) {
      issues.push({
        path: [index, 'deliveryDate'],
        message: 'Each delivery date can only appear once.',
      });
    } else {
      dates.add(date);
    }

    const quantity = Number(quantityText);
    if (input.quantityType === 'bags') {
      if (!quantityText || !Number.isInteger(quantity) || quantity <= 0) {
        issues.push({
          path: [index, 'quantity'],
          message: 'Enter a whole number of bags greater than 0.',
        });
        return;
      }
    } else if (!quantityText || !Number.isFinite(quantity) || quantity <= 0) {
      issues.push({
        path: [index, 'quantity'],
        message: 'Enter acres greater than 0.',
      });
      return;
    } else if (!acresHasAtMostDecimals(quantityText, ACRES_MAX_DECIMALS)) {
      issues.push({
        path: [index, 'quantity'],
        message: `Enter acres with up to ${ACRES_MAX_DECIMALS} decimal places.`,
      });
      return;
    }

    scheduled += quantity;
  });

  if (Number.isFinite(input.total) && scheduled > input.total + 0.001) {
    issues.push({
      path: [],
      message: 'Scheduled quantity cannot exceed the requested total.',
    });
  }

  return issues;
}

export function formatDeliveryQuantity(line: SeedRequisitionDelivery) {
  if (line.bags != null) {
    return `${line.bags} ${line.bags === 1 ? 'bag' : 'bags'}`;
  }
  if (line.acres != null && line.acres !== '') {
    const acres = Number(line.acres);
    const label = Number.isFinite(acres) ? acres.toString() : line.acres;
    return `${label} acres`;
  }
  return '';
}

export function formatRequestedDeliveries(
  deliveries: SeedRequisitionDelivery[] | null | undefined,
) {
  if (!deliveries?.length) return '';
  return [...deliveries]
    .sort((left, right) => left.deliveryDate.localeCompare(right.deliveryDate))
    .map((line) => {
      const quantity = formatDeliveryQuantity(line);
      const date = formatRequisitionDate(line.deliveryDate);
      const status =
        line.status === 'APPROVED'
          ? 'Approved'
          : line.status === 'REJECTED'
            ? 'Rejected'
            : 'Pending';
      const amount = quantity ? `${quantity} · ${date}` : date;
      return `${amount} · ${status}`;
    })
    .filter(Boolean)
    .join(', ');
}

export function statusFromDeliveries(
  deliveries: Array<Pick<SeedRequisitionDelivery, 'status'>> | null | undefined,
) {
  if (!deliveries?.length || deliveries.some((line) => line.status === 'PENDING')) {
    return 'PENDING' as const;
  }
  if (deliveries.some((line) => line.status === 'APPROVED')) return 'APPROVED' as const;
  return 'REJECTED' as const;
}

export function earliestRequestedDeliveryDate(
  deliveries: SeedRequisitionDelivery[] | null | undefined,
) {
  if (!deliveries?.length) return null;
  return (
    [...deliveries].sort((left, right) => left.deliveryDate.localeCompare(right.deliveryDate))[0]
      ?.deliveryDate ?? null
  );
}

export function scheduledQuantity(lines: DeliveryScheduleLine[]) {
  return lines.reduce((sum, line) => {
    const quantity = Number(line.quantity);
    return Number.isFinite(quantity) ? sum + quantity : sum;
  }, 0);
}
