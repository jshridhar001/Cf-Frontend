export type FarmerContract = {
  id: string;
  variety: string;
  date: string;
  acres: string | number;
  contractUrl: string;
  hindiContractUrl: string;
  isNotarized: boolean;
};

export type FarmerContractRow = FarmerContract & {
  farmerId: string;
  farmerName: string;
};

export type FarmerContractResponse = {
  success: boolean;
  data?: FarmerContract;
  message?: string;
};

export function formatContractAcres(acres: string | number) {
  const n = typeof acres === 'number' ? acres : Number(acres);
  if (!Number.isFinite(n)) return String(acres ?? '');
  return n.toLocaleString(undefined, { maximumFractionDigits: 3 });
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
  return n.toFixed(3);
}

export function flattenFarmerContracts(
  farmers: Array<{ id: string; name: string; contracts?: FarmerContract[] }>,
): FarmerContractRow[] {
  return farmers.flatMap((farmer) =>
    (farmer.contracts ?? []).map((contract) => ({
      id: String(contract.id ?? ''),
      variety: String(contract.variety ?? ''),
      date: String(contract.date ?? '').slice(0, 10),
      acres: contract.acres,
      contractUrl: String(contract.contractUrl ?? ''),
      hindiContractUrl: String(contract.hindiContractUrl ?? ''),
      isNotarized: Boolean(contract.isNotarized),
      farmerId: farmer.id,
      farmerName: farmer.name,
    })),
  );
}
