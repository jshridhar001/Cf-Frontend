export const SEED_REQUISITION_OVERVIEW_TITLE = 'Seed Requisition — Overview';

export const SEED_REQUISITION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export const SEED_REQUISITION_PAGE_SIZES = [10, 50, 100] as const;
export const SEED_REQUISITION_PAGE_SIZE = SEED_REQUISITION_PAGE_SIZES[0];

export type SeedRequisitionPageSize = (typeof SEED_REQUISITION_PAGE_SIZES)[number];

export type SeedRequisitionStatus = (typeof SEED_REQUISITION_STATUSES)[number];

export type SeedRequisitionPlace = {
  name: string;
};

export type SeedRequisitionFarmer = {
  name: string;
  accountNumber: string;
  mobileNumber?: string;
  station?: SeedRequisitionPlace | null;
  locality?: SeedRequisitionPlace | null;
};

export type SeedRequisitionVariety = {
  name: string;
};

export type SeedRequisitionActor = {
  name: string;
};

export type SeedRequisition = {
  id: string;
  farmerId: string;
  varietyId: string;
  status: SeedRequisitionStatus;
  requestedBags: number | null;
  requestedAcres: string | null;
  fulfilledBags: number;
  fulfilledAcres: string;
  requisitionDate: string;
  requestedDeliveryDate: string;
  remarks: string | null;
  rejectionRemarks: string | null;
  createdById: string;
  approvedById: string | null;
  rejectedById: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  farmer: SeedRequisitionFarmer | null;
  variety: SeedRequisitionVariety | null;
  createdBy?: SeedRequisitionActor | null;
  approvedBy?: SeedRequisitionActor | null;
  rejectedBy?: SeedRequisitionActor | null;
  dispatchStops?: unknown[];
};

export type SeedRequisitionListMeta = {
  page: number;
  pageSize: number;
  total: number;
};

export type SeedRequisitionsResponse = {
  success: boolean;
  data: SeedRequisition[];
  meta: SeedRequisitionListMeta;
};

export type SeedRequisitionResponse = {
  success: boolean;
  data: SeedRequisition;
  message?: string;
};

export type SeedRequisitionMessageResponse = {
  success: boolean;
  message: string;
};

export type SeedRequisitionListParams = {
  page: number;
  pageSize: number;
  status?: SeedRequisitionStatus;
  farmerId?: string;
  varietyId?: string;
  requisitionDateFrom?: string;
  requisitionDateTo?: string;
};

export type SeedRequisitionOption = {
  id: string;
  name: string;
  accountNumber?: string;
};

export function isSeedRequisitionStatus(value: string): value is SeedRequisitionStatus {
  return SEED_REQUISITION_STATUSES.includes(value as SeedRequisitionStatus);
}

export function isSeedRequisitionPageSize(value: number): value is SeedRequisitionPageSize {
  return SEED_REQUISITION_PAGE_SIZES.includes(value as SeedRequisitionPageSize);
}

export function formatSeedRequisitionStatus(status: SeedRequisitionStatus) {
  switch (status) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Pending';
  }
}

export function formatRequisitionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatRequestedQuantity(requisition: SeedRequisition) {
  if (requisition.requestedAcres != null && requisition.requestedAcres !== '') {
    const acres = Number(requisition.requestedAcres);
    const label = Number.isFinite(acres) ? acres.toString() : requisition.requestedAcres;
    return `${label} acres`;
  }
  const bags = requisition.requestedBags ?? 0;
  return `${bags} ${bags === 1 ? 'bag' : 'bags'}`;
}

export function formatRequestedAcresPayload(value: string) {
  const acres = Number(value);
  if (!Number.isFinite(acres)) return value.trim();
  return acres.toFixed(3);
}

export function toDateInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function toRequisitionDateParam(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  return value;
}
