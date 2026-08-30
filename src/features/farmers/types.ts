export const FARMER_ACCOUNT_TYPES = ['INDIVIDUAL', 'FAMILY_PRIMARY', 'FAMILY_MEMBER'] as const;
export const FARMER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export type FarmerAccountType = (typeof FARMER_ACCOUNT_TYPES)[number];
export type FarmerStatus = (typeof FARMER_STATUSES)[number];

export type FarmerPlace = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  stationId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FarmerFamily = {
  id: string;
  name: string;
  accountNumber: string;
  stationId: string;
  localityId: string;
  station?: FarmerPlace | null;
  locality?: FarmerPlace | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FarmerContract = {
  id: string;
  variety: string;
  date: string;
  acres: string | number;
  contractUrl: string;
};

export type FarmerContractRow = FarmerContract & {
  farmerId: string;
  farmerName: string;
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
  stationId: string;
  localityId: string;
  station?: FarmerPlace | null;
  locality?: FarmerPlace | null;
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

export type FarmerContractResponse = {
  success: boolean;
  data?: FarmerContract;
  message?: string;
};

export function formatContractAcres(acres: string | number) {
  const n = typeof acres === 'number' ? acres : Number(acres);
  if (!Number.isFinite(n)) return String(acres ?? '');
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatContractDate(date: string) {
  const day = date.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return date;
  const parsed = new Date(`${day}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatContractAcresPayload(acres: string) {
  const n = Number(acres);
  if (!Number.isFinite(n)) return acres.trim();
  return n.toFixed(2);
}

export function normalizeFarmerContracts(
  contracts: FarmerContract[] | undefined,
): FarmerContract[] {
  return (contracts ?? []).map((contract) => ({
    id: String(contract.id ?? ''),
    variety: String(contract.variety ?? ''),
    date: String(contract.date ?? '').slice(0, 10),
    acres: contract.acres,
    contractUrl: String(contract.contractUrl ?? ''),
  }));
}

export function flattenFarmerContracts(farmers: Farmer[]): FarmerContractRow[] {
  return farmers.flatMap((farmer) =>
    normalizeFarmerContracts(farmer.contracts).map((contract) => ({
      ...contract,
      farmerId: farmer.id,
      farmerName: farmer.name,
    })),
  );
}

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

export function getFarmerStationName(farmer: Farmer, stations?: { id: string; name: string }[]) {
  if (farmer.station?.name) return farmer.station.name;
  return stations?.find((station) => station.id === farmer.stationId)?.name ?? farmer.stationId;
}

export function getFarmerLocalityName(
  farmer: Farmer,
  stations?: { id: string; name: string; localities: { id: string; name: string }[] }[],
) {
  if (farmer.locality?.name) return farmer.locality.name;
  for (const station of stations ?? []) {
    const locality = station.localities.find((item) => item.id === farmer.localityId);
    if (locality) return locality.name;
  }
  return farmer.localityId;
}

export function normalizeFarmerFamily(raw: Record<string, unknown>): FarmerFamily {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? raw.familyName ?? ''),
    accountNumber: String(raw.accountNumber ?? raw.familyAccountNumber ?? ''),
    stationId: String(raw.stationId ?? ''),
    localityId: String(raw.localityId ?? ''),
  };
}
