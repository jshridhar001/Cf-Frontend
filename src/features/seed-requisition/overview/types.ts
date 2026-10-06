export const SEED_REQUISITION_OVERVIEW_TITLE = 'Seed Requisition — Overview';

export const SEED_REQUISITION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export const SEED_REQUISITION_PAGE_SIZES = [10, 50, 100] as const;
export const SEED_REQUISITION_PAGE_SIZE = SEED_REQUISITION_PAGE_SIZES[0];

export type SeedRequisitionPageSize = (typeof SEED_REQUISITION_PAGE_SIZES)[number];

export type SeedRequisitionStatus = (typeof SEED_REQUISITION_STATUSES)[number];

export type SeedRequisitionPlace = {
  id?: string;
  name: string;
  pincode?: string | null;
};

export type SeedRequisitionFamily = {
  id: string;
  name: string;
  accountNumber: string;
};

export type SeedRequisitionFarmer = {
  id?: string;
  name: string;
  accountNumber: string;
  mobileNumber?: string;
  aadharNumber?: string | null;
  panNumber?: string | null;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  status?: string;
  stationId?: string | null;
  villageId?: string | null;
  postOfficeId?: string | null;
  policeStationId?: string | null;
  districtId?: string | null;
  stateId?: string | null;
  pincodeId?: string | null;
  familyId?: string | null;
  family?: SeedRequisitionFamily | null;
  createdAt?: string;
  updatedAt?: string;
  state?: SeedRequisitionPlace | null;
  district?: SeedRequisitionPlace | null;
  station?: SeedRequisitionPlace | null;
  policeStation?: SeedRequisitionPlace | null;
  pincode?: SeedRequisitionPlace | null;
  postOffice?: SeedRequisitionPlace | null;
  village?: SeedRequisitionPlace | null;
  area?: {
    id?: string;
    name?: string;
    village?:
      | (SeedRequisitionPlace & {
          policeStation?:
            | (SeedRequisitionPlace & {
                postOffice?:
                  | (SeedRequisitionPlace & {
                      district?: SeedRequisitionPlace & { state?: SeedRequisitionPlace };
                    })
                  | null;
              })
            | null;
        })
      | null;
    policeStation?: SeedRequisitionPlace | null;
    postOffice?: SeedRequisitionPlace | null;
    district?: SeedRequisitionPlace | null;
    state?: SeedRequisitionPlace | null;
  } | null;
};

export function getRequisitionPlaceName(place?: SeedRequisitionPlace | null): string {
  return place?.name?.trim() ?? '';
}

export function getRequisitionVillageName(farmer?: SeedRequisitionFarmer | null): string {
  return getRequisitionPlaceName(farmer?.village) || farmer?.area?.village?.name?.trim() || '';
}

export function getRequisitionDistrictName(farmer?: SeedRequisitionFarmer | null): string {
  return (
    getRequisitionPlaceName(farmer?.district) ||
    farmer?.area?.village?.policeStation?.postOffice?.district?.name?.trim() ||
    farmer?.area?.district?.name?.trim() ||
    ''
  );
}

export function getRequisitionPlaceLabel(farmer?: SeedRequisitionFarmer | null): string {
  return (
    [getRequisitionVillageName(farmer), getRequisitionDistrictName(farmer)]
      .filter(Boolean)
      .join(' · ') || '—'
  );
}

export function getRequisitionFamilyLabel(farmer?: SeedRequisitionFarmer | null): string {
  return farmer?.family?.name?.trim() || 'Independent';
}

export type SeedRequisitionVariety = {
  id?: string;
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
  requisitionDate: string | null;
  contractDate?: string | null;
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
  farmer: SeedRequisitionFarmer | null;
  variety: SeedRequisitionVariety | null;
  createdBy?: SeedRequisitionActor | null;
  approvedBy?: SeedRequisitionActor | null;
  rejectedBy?: SeedRequisitionActor | null;
  dispatchStops?: unknown[];
};

export type ApiSeedRequisitionPlace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiSeedRequisitionFamily = {
  id: string;
  name: string;
  accountNumber: string;
};

export type ApiSeedRequisitionFarmer = {
  id: string;
  name: string;
  accountNumber: string;
  mobileNumber: string;
  aadharNumber: string | null;
  panNumber: string | null;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
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
  family: ApiSeedRequisitionFamily | null;
  createdAt: string;
  updatedAt: string;
  state: ApiSeedRequisitionPlace | null;
  district: ApiSeedRequisitionPlace | null;
  station: ApiSeedRequisitionPlace | null;
  policeStation: ApiSeedRequisitionPlace | null;
  pincode: ApiSeedRequisitionPlace | null;
  postOffice: ApiSeedRequisitionPlace | null;
  village: ApiSeedRequisitionPlace | null;
};

export type ApiSeedRequisitionVariety = {
  id: string;
  name: string;
};

export type ApiSeedRequisition = {
  id: string;
  farmerId: string;
  varietyId: string;
  status: SeedRequisitionStatus;
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
  farmer: ApiSeedRequisitionFarmer;
  variety: ApiSeedRequisitionVariety;
};

export type SeedRequisitionsResponse = {
  success: boolean;
  data: ApiSeedRequisition[];
};

export type SeedRequisitionDecisionResponse = {
  success: boolean;
  data: ApiSeedRequisition;
};

export type CreateSeedRequisitionBody = {
  farmerId: string;
  varietyId: string;
  contractDate: string;
  requestedBags?: number;
  requestedAcres?: number;
  requisitionDate?: string;
  requestedDeliveryDate?: string;
  remarks?: string;
  engContractUrl?: string | null;
  hindiContractUrl?: string | null;
};

export function toSeedRequisition(row: ApiSeedRequisition): SeedRequisition {
  return {
    id: row.id,
    farmerId: row.farmerId,
    varietyId: row.varietyId,
    status: row.status,
    requestedBags: row.requestedBags,
    requestedAcres: row.requestedAcres,
    fulfilledBags: row.fulfilledBags,
    fulfilledAcres: row.fulfilledAcres,
    requisitionDate: row.requisitionDate,
    contractDate: row.contractDate,
    engContractUrl: row.engContractUrl,
    hindiContractUrl: row.hindiContractUrl,
    requestedDeliveryDate: row.requestedDeliveryDate,
    approvedDeliveryDate: row.approvedDeliveryDate,
    remarks: row.remarks,
    rejectionRemarks: row.rejectionRemarks,
    createdById: row.createdById,
    approvedById: row.approvedById,
    rejectedById: row.rejectedById,
    approvedAt: row.approvedAt,
    rejectedAt: row.rejectedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    farmer: {
      id: row.farmer.id,
      name: row.farmer.name,
      accountNumber: row.farmer.accountNumber,
      mobileNumber: row.farmer.mobileNumber,
      aadharNumber: row.farmer.aadharNumber,
      panNumber: row.farmer.panNumber,
      bankName: row.farmer.bankName,
      bankAccountNumber: row.farmer.bankAccountNumber,
      ifscCode: row.farmer.ifscCode,
      accountType: row.farmer.accountType,
      status: row.farmer.status,
      stationId: row.farmer.stationId,
      villageId: row.farmer.villageId,
      postOfficeId: row.farmer.postOfficeId,
      policeStationId: row.farmer.policeStationId,
      districtId: row.farmer.districtId,
      stateId: row.farmer.stateId,
      pincodeId: row.farmer.pincodeId,
      familyId: row.farmer.familyId,
      family: row.farmer.family
        ? {
            id: row.farmer.family.id,
            name: row.farmer.family.name,
            accountNumber: row.farmer.family.accountNumber,
          }
        : null,
      createdAt: row.farmer.createdAt,
      updatedAt: row.farmer.updatedAt,
      state: row.farmer.state,
      district: row.farmer.district,
      station: row.farmer.station,
      policeStation: row.farmer.policeStation,
      pincode: row.farmer.pincode,
      postOffice: row.farmer.postOffice,
      village: row.farmer.village,
    },
    variety: {
      id: row.variety.id,
      name: row.variety.name,
    },
  };
}

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
  const parts: string[] = [];
  if (requisition.requestedBags != null) {
    const bags = requisition.requestedBags;
    parts.push(`${bags} ${bags === 1 ? 'bag' : 'bags'}`);
  }
  if (requisition.requestedAcres != null && requisition.requestedAcres !== '') {
    const acres = Number(requisition.requestedAcres);
    const label = Number.isFinite(acres) ? acres.toString() : requisition.requestedAcres;
    parts.push(`${label} acres`);
  }
  return parts.join(' · ') || '—';
}

export function formatRequestedAcresPayload(value: string) {
  const acres = Number(value);
  if (!Number.isFinite(acres)) return value.trim();
  return acres.toFixed(3);
}

export function parseRequestedAcres(value: string) {
  const acres = Number(value);
  if (!Number.isFinite(acres)) return Number.NaN;
  return Number(acres.toFixed(2));
}

export function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
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
