import type { FarmerContract } from '@/features/farmers/contract/types';
import { type CascadeValues, emptyCascade } from '@/features/master/lib/address-levels';

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

export type FarmerFamily = {
  id: string;
  name: string;
  accountNumber: string;
  areaId: string;
  area?: FarmerArea | null;
  createdAt?: string;
  updatedAt?: string;
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
  areaId: string;
  area?: FarmerArea | null;
  familyId: string | null;
  family?: FarmerFamily | null;
  familyName?: string | null;
  familyAccountNumber?: string | null;
  contractUrl: string | null;
  contracts?: FarmerContract[];
  bankName: string | null;
  ifscCode: string | null;
  bankAccountNumber: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FarmerAddressValues = CascadeValues & { areaId: string };

export type FarmersResponse = {
  success: boolean;
  data: Farmer[];
};

export type FarmerResponse = {
  success: boolean;
  data: Farmer;
};

export type FarmerFamiliesResponse = {
  success: boolean;
  data: unknown;
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

export function getFarmerVillageName(farmer: Pick<Farmer, 'area'>): string {
  return farmer.area?.village?.name?.trim() ?? '';
}

export function getFarmerDistrictName(farmer: Pick<Farmer, 'area'>): string {
  return farmer.area?.village?.policeStation?.postOffice?.district?.name?.trim() ?? '';
}

export function getFarmerPlacePath(farmer: Pick<Farmer, 'area'>): string {
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

export function normalizeFarmerFamily(raw: Record<string, unknown>): FarmerFamily {
  const area = (raw.area as FarmerArea | undefined) ?? null;
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? raw.familyName ?? ''),
    accountNumber: String(raw.accountNumber ?? raw.familyAccountNumber ?? ''),
    areaId: String(raw.areaId ?? area?.id ?? ''),
    area,
  };
}
