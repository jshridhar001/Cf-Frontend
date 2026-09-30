export const SEED_DISPATCH_OVERVIEW_TITLE = 'Seed Dispatches — Overview';

export const SEED_DISPATCH_STATUSES = ['IN_TRANSIT', 'DELIVERED', 'AWAITING_DISPATCH'] as const;
export const SEED_DISPATCH_PAGE_SIZES = [10, 50, 100] as const;
export const SEED_DISPATCH_PAGE_SIZE = SEED_DISPATCH_PAGE_SIZES[0];

export type SeedDispatchPageSize = (typeof SEED_DISPATCH_PAGE_SIZES)[number];

export type SeedDispatchStatus = (typeof SEED_DISPATCH_STATUSES)[number];

export const DISPATCH_REQUISITION_STATUSES = ['RECEIVED', 'PENDING'] as const;
export type DispatchRequisitionStatus = (typeof DISPATCH_REQUISITION_STATUSES)[number];

export type SeedDispatchFacility = {
  id: string;
  name: string;
  usedIn: string;
  totalBagsDispatched: number;
  createdAt: string;
  updatedAt: string;
};

export type SeedDispatchSeedSize = {
  id: string;
  name: string;
  seedBagsPerAcre: number;
  createdAt: string;
  updatedAt: string;
};

export type SeedDispatchGeneration = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SeedDispatchSizeLine = {
  id: string;
  dispatchRequisitionId: string;
  facilityId: string;
  sizeId: string;
  generationId: string;
  bagQuantity: number;
  facility: SeedDispatchFacility;
  size: SeedDispatchSeedSize;
  generation: SeedDispatchGeneration;
};

export type SeedDispatchFarmer = {
  id: string;
  name: string;
  accountNumber: string;
  mobileNumber: string;
  aadharNumber: string | null;
  panNumber: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  accountType: string;
  status: string;
  stationId: string | null;
  villageId: string | null;
  postOfficeId: string | null;
  policeStationId: string | null;
  districtId: string | null;
  stateId: string | null;
  pincodeId: string | null;
  familyId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SeedDispatchVariety = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SeedDispatchRequisitionDetail = {
  id: string;
  farmerId: string;
  varietyId: string;
  status: string;
  requestedBags: number | null;
  requestedAcres: string | null;
  fulfilledBags: number;
  fulfilledAcres: string;
  requisitionDate: string | null;
  contractDate: string | null;
  engContractUrl: string | null;
  hindiContractUrl: string | null;
  requestedDeliveryDate: string | null;
  approvedDeliveryDate: string | null;
  remarks: string | null;
  rejectionRemarks: string | null;
  createdById: string;
  approvedById: string | null;
  rejectedById: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  farmer: SeedDispatchFarmer;
  variety: SeedDispatchVariety;
};

export type SeedDispatchRequisition = {
  id: string;
  dispatchId: string;
  requisitionId: string;
  status: DispatchRequisitionStatus | string;
  otpSentAt: string | null;
  otpVerifiedAt: string | null;
  receivedAt: string | null;
  receivedById: string | null;
  requisition: SeedDispatchRequisitionDetail;
  sizeLines: SeedDispatchSizeLine[];
};

export type SeedDispatch = {
  id: string;
  toLocation: string;
  status: SeedDispatchStatus;
  dispatchDate: string | null;
  truckNumber: string | null;
  driverMobile: string | null;
  manualGatePassNumber: string | null;
  weightSlipNumber: string | null;
  grossWeight: string | null;
  tareWeight: string | null;
  netWeight: string | null;
  remarks: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  dispatchRequisitions: SeedDispatchRequisition[];
};

export type SeedDispatchesResponse = {
  success: boolean;
  data: SeedDispatch[];
};

export function isSeedDispatchStatus(value: string): value is SeedDispatchStatus {
  return SEED_DISPATCH_STATUSES.includes(value as SeedDispatchStatus);
}

export function isSeedDispatchPageSize(value: number): value is SeedDispatchPageSize {
  return SEED_DISPATCH_PAGE_SIZES.includes(value as SeedDispatchPageSize);
}

export function formatSeedDispatchStatus(status: SeedDispatchStatus) {
  switch (status) {
    case 'IN_TRANSIT':
      return 'In Transit';
    case 'DELIVERED':
      return 'Delivered';
    case 'AWAITING_DISPATCH':
      return 'Awaiting Dispatch';
  }
}

export function formatDispatchDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

const weightFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

export function formatNetWeight(value: string | null | undefined) {
  if (value == null || value === '') return '—';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${value} kg`;
  return `${weightFormatter.format(amount)} kg`;
}
