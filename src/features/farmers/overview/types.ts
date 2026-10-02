export const FARMER_ACCOUNT_TYPES = ['INDIVIDUAL', 'FAMILY_PRIMARY', 'FAMILY_MEMBER'] as const;
export const FARMER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export type FarmerAccountType = (typeof FARMER_ACCOUNT_TYPES)[number];
export type FarmerStatus = (typeof FARMER_STATUSES)[number];

export type FarmerAddressNode = {
  id: string;
  name: string;
  pincode?: string | null;
  stateId?: string;
  districtId?: string;
  postOfficeId?: string;
  policeStationId?: string;
  villageId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FarmerArea = FarmerAddressNode & {
  villageId: string;
  village?: FarmerAddressNode & {
    policeStation?: FarmerAddressNode & {
      postOffice?: FarmerAddressNode & {
        pincode?: string | null;
        district?: FarmerAddressNode & {
          state?: FarmerAddressNode;
        };
      };
    };
  };
};

export type FarmerContract = {
  id: string;
};

export type FarmerFamily = {
  id: string;
  name: string;
  accountNumber: string;
  areaId: string;
  stationId?: string | null;
  area?: FarmerArea | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FarmerPlace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type FarmerSeedRequisitionVariety = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FarmerSeedRequisition = {
  id: string;
  farmerId: string;
  varietyId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBags: number | null;
  requestedAcres: string | null;
  fulfilledBags: number;
  fulfilledAcres: string;
  requisitionDate: string | null;
  contractDate: string | null;
  requestedDeliveryDate: string | null;
  approvedDeliveryDate: string | null;
  remarks: string | null;
  rejectionRemarks: string | null;
  engContractUrl: string | null;
  hindiContractUrl: string | null;
  createdById: string;
  approvedById: string | null;
  rejectedById: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  variety: FarmerSeedRequisitionVariety | null;
};

export type ApiFarmer = {
  id: string;
  name: string;
  accountNumber: string;
  mobileNumber: string;
  aadharNumber: string | null;
  panNumber: string | null;
  accountType: FarmerAccountType;
  status: FarmerStatus;
  stationId: string | null;
  villageId: string | null;
  postOfficeId: string | null;
  policeStationId: string | null;
  districtId: string | null;
  stateId: string | null;
  pincodeId: string | null;
  familyId: string | null;
  family?: {
    id: string;
    name: string;
    accountNumber: string;
    stationId?: string | null;
    areaId?: string;
    area?: FarmerArea | null;
  } | null;
  familyName?: string | null;
  familyAccountNumber?: string | null;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  createdAt: string;
  updatedAt: string;
  state: FarmerPlace | null;
  district: FarmerPlace | null;
  station: FarmerPlace | null;
  policeStation: FarmerPlace | null;
  pincode: FarmerPlace | null;
  postOffice: FarmerPlace | null;
  village: FarmerPlace | null;
  seedRequisitions: FarmerSeedRequisition[];
};

export type Farmer = {
  id: string;
  name: string;
  accountNumber: string;
  mobileNumber: string;
  aadharNumber: string | null;
  panNumber: string | null;
  accountType: FarmerAccountType;
  status: FarmerStatus;
  stationId?: string | null;
  villageId?: string | null;
  postOfficeId?: string | null;
  policeStationId?: string | null;
  districtId?: string | null;
  stateId?: string | null;
  pincodeId?: string | null;
  state?: FarmerPlace | null;
  district?: FarmerPlace | null;
  station?: FarmerPlace | null;
  policeStation?: FarmerPlace | null;
  pincode?: FarmerPlace | null;
  postOffice?: FarmerPlace | null;
  village?: FarmerPlace | null;
  areaId: string;
  area?: FarmerArea | null;
  familyId: string | null;
  family?: FarmerFamily | null;
  familyName?: string | null;
  familyAccountNumber?: string | null;
  contracts?: FarmerContract[];
  seedRequisitions: FarmerSeedRequisition[];
  bankName: string;
  ifscCode: string;
  bankAccountNumber: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CascadeValues = {
  stateId: string;
  districtId: string;
  postOfficeId: string;
  policeStationId: string;
  villageId: string;
};

export type FarmerAddressValues = CascadeValues & { areaId: string };

export function emptyCascade(): CascadeValues {
  return {
    stateId: '',
    districtId: '',
    postOfficeId: '',
    policeStationId: '',
    villageId: '',
  };
}

export type FarmersResponse = {
  success: boolean;
  data: ApiFarmer[];
};

export type FarmerAddressOption = {
  id: string;
  name: string;
};

export type FarmerAddressOptions = {
  states: FarmerAddressOption[];
  districts: FarmerAddressOption[];
  stations: FarmerAddressOption[];
  policeStations: FarmerAddressOption[];
  pincodes: FarmerAddressOption[];
  postOffices: FarmerAddressOption[];
  villages: FarmerAddressOption[];
};

export type FarmerAddressOptionsResponse = {
  success: boolean;
  data: FarmerAddressOptions;
};

export type ApiFarmerResponse = {
  success: boolean;
  data: ApiFarmer;
};

export type CreateFarmerBody = {
  name: string;
  accountNumber: string;
  mobileNumber: string;
  aadharNumber?: string;
  panNumber?: string;
  accountType: FarmerAccountType;
  stationId: string;
  villageId: string;
  postOfficeId: string;
  policeStationId: string;
  districtId: string;
  stateId: string;
  pincodeId: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  familyName?: string;
  familyAccountNumber?: string;
  familyId?: string;
};

export function toFarmer(row: ApiFarmer): Farmer {
  const family = familyFromApi(row);
  return {
    id: row.id,
    name: row.name,
    accountNumber: row.accountNumber,
    mobileNumber: row.mobileNumber,
    aadharNumber: row.aadharNumber,
    panNumber: row.panNumber,
    accountType: row.accountType,
    status: row.status,
    stationId: row.stationId,
    villageId: row.villageId,
    postOfficeId: row.postOfficeId,
    policeStationId: row.policeStationId,
    districtId: row.districtId,
    stateId: row.stateId,
    pincodeId: row.pincodeId,
    state: row.state,
    district: row.district,
    station: row.station,
    policeStation: row.policeStation,
    pincode: row.pincode,
    postOffice: row.postOffice,
    village: row.village,
    areaId: row.stationId ?? '',
    familyId: row.familyId ?? family?.id ?? null,
    family,
    familyName: family?.name ?? row.familyName ?? null,
    familyAccountNumber: family?.accountNumber ?? row.familyAccountNumber ?? null,
    seedRequisitions: row.seedRequisitions ?? [],
    bankName: row.bankName,
    bankAccountNumber: row.bankAccountNumber,
    ifscCode: row.ifscCode,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export type FarmerResponse = {
  success: boolean;
  data: Farmer;
};

export type FarmerFamiliesResponse = {
  success: boolean;
  data: unknown[];
};

export type FarmerMessageResponse = {
  success: boolean;
  message: string;
};

export function isFarmerAccountType(value: string): value is FarmerAccountType {
  return FARMER_ACCOUNT_TYPES.includes(value as FarmerAccountType);
}

export function isFarmerStatus(value: string): value is FarmerStatus {
  return FARMER_STATUSES.includes(value as FarmerStatus);
}

export function formatFarmerStatus(status: FarmerStatus) {
  return status === 'ACTIVE' ? 'Active' : 'Inactive';
}

export function formatFarmerAccountType(accountType: FarmerAccountType) {
  switch (accountType) {
    case 'FAMILY_PRIMARY':
      return 'Family primary';
    case 'FAMILY_MEMBER':
      return 'Family member';
    default:
      return 'Individual';
  }
}

export function getFarmerVillageName(farmer: Pick<Farmer, 'area' | 'village'>): string {
  return farmer.village?.name?.trim() || farmer.area?.village?.name?.trim() || '';
}

export function getFarmerDistrictName(farmer: Pick<Farmer, 'area' | 'district'>): string {
  return (
    farmer.district?.name?.trim() ||
    farmer.area?.village?.policeStation?.postOffice?.district?.name?.trim() ||
    ''
  );
}

export function getFarmerPlacePath(farmer: Pick<Farmer, 'area' | 'village' | 'district'>): string {
  return [getFarmerVillageName(farmer), getFarmerDistrictName(farmer)].filter(Boolean).join(' · ');
}

export function emptyFarmerAddress(): FarmerAddressValues {
  return { ...emptyCascade(), areaId: '' };
}

export function farmerAreaCascade(area?: FarmerArea | null): FarmerAddressValues {
  const village = area?.village;
  const policeStation = village?.policeStation;
  const postOffice = policeStation?.postOffice;
  const district = postOffice?.district;
  const state = district?.state;
  return {
    stateId: state?.id ?? '',
    districtId: district?.id ?? '',
    postOfficeId: postOffice?.id ?? '',
    policeStationId: policeStation?.id ?? village?.policeStationId ?? '',
    villageId: village?.id ?? area?.villageId ?? '',
    areaId: area?.id ?? '',
  };
}

function optionalId(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function nestedStationId(value: unknown): string | null {
  if (!value || typeof value !== 'object' || !('id' in value)) return null;
  return optionalId(value.id);
}

export function familyFromApi(row: {
  family?: ApiFarmer['family'] | FarmerFamily | null;
  familyId?: string | null;
  familyName?: string | null;
  familyAccountNumber?: string | null;
  stationId?: string | null;
}): FarmerFamily | null {
  if (row.family && typeof row.family === 'object') {
    const family = normalizeFarmerFamily(row.family as unknown as Record<string, unknown>);
    return family.id ? family : null;
  }
  if (!row.familyId) return null;
  return {
    id: row.familyId,
    name: row.familyName?.trim() || 'Current family',
    accountNumber: row.familyAccountNumber?.trim() || '',
    areaId: '',
    stationId: row.stationId,
  };
}

export function getFarmerFamilyLabel(farmer: Pick<Farmer, 'family' | 'familyName'>): string {
  return farmer.family?.name?.trim() || farmer.familyName?.trim() || 'Independent';
}

export function normalizeFarmerFamily(raw: Record<string, unknown>): FarmerFamily {
  const area = (raw.area as FarmerArea | undefined) ?? null;
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? raw.familyName ?? ''),
    accountNumber: String(raw.accountNumber ?? raw.familyAccountNumber ?? ''),
    areaId: String(raw.areaId ?? area?.id ?? ''),
    stationId: optionalId(raw.stationId) ?? nestedStationId(raw.station),
    area,
  };
}
