import { format, isValid } from 'date-fns';

import type {
  SeedRequisition,
  SeedRequisitionApiStatus,
  SeedRequisitionDetail,
  SeedRequisitionRow,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/report/types';

const STATUS_MAP: Record<SeedRequisitionApiStatus, SeedRequisitionStatus> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/** Converts a YYYY-MM-DD form value to an ISO-8601 datetime string. */
export function dateOnlyToIsoDatetime(dateOnly: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly.trim());
  if (!match) {
    return new Date(dateOnly).toISOString();
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day).toISOString();
}

function isoToDateOnly(value: string | null | undefined): string {
  if (!value?.trim()) return '';

  const date = new Date(value);
  if (!isValid(date)) return '';

  return format(date, 'yyyy-MM-dd');
}

export function mapSeedRequisitionToRow(requisition: SeedRequisition): SeedRequisitionRow {
  return {
    id: requisition.id,
    farmer: requisition.farmer?.name ?? '',
    variety: requisition.variety?.name ?? '',
    acres: Number(requisition.requestedAcres) || 0,
    seedBags: Number(requisition.requestedBags) || 0,
    status: STATUS_MAP[requisition.status],
    requisitionDate: isoToDateOnly(requisition.requisitionDate),
    requestedDeliveryDate: isoToDateOnly(requisition.requestedDeliveryDate),
    approvedDelivery: isoToDateOnly(requisition.approvedDeliveryDate),
    rejectionDate: isoToDateOnly(requisition.rejectedAt),
    remarks: requisition.remarks ?? '',
    rejectionRemarks: requisition.rejectionRemarks ?? '',
  };
}

export function mapSeedRequisitionToDetail(requisition: SeedRequisition): SeedRequisitionDetail {
  return {
    ...mapSeedRequisitionToRow(requisition),
    farmerAccountNumber: requisition.farmer?.accountNumber ?? '',
    farmerMobile: requisition.farmer?.mobileNumber ?? '',
    station: requisition.farmer?.station?.name ?? '',
    locality: requisition.farmer?.locality?.name ?? '',
    fulfilledQuantity: Number(requisition.fulfilledBags) || 0,
    fulfilledAcres: Number(requisition.fulfilledAcres) || 0,
    createdAt: requisition.createdAt,
    approvedAt: requisition.approvedAt,
    rejectedAt: requisition.rejectedAt,
    createdByName: requisition.createdBy?.name ?? null,
    approvedByName: requisition.approvedBy?.name ?? null,
    rejectedByName: requisition.rejectedBy?.name ?? null,
  };
}
