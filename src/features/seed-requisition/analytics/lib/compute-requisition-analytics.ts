import type { SeedRequisition } from '@/features/seed-requisition/overview/types';
import {
  getRequisitionDistrictName,
  getRequisitionVillageName,
} from '@/features/seed-requisition/overview/types';

const HOT_SHARE = 75;
const HOT_MAX = 5;
const RELATION_SPLIT = /\s+(?:s\/o|w\/o|d\/o)\s+/i;
const FATHER_PATTERN = /\bs\/o\s+(.+)$/i;

const IFSC_BANKS: Record<string, string> = {
  SBIN: 'State Bank of India',
  UTIB: 'Axis Bank',
  HDFC: 'HDFC Bank',
  PUNB: 'Punjab National Bank',
  NTBL: 'Nainital Bank',
  BARB: 'Bank of Baroda',
  BKID: 'Bank of India',
};

export const PLACE_LEVELS = ['station', 'policeStation', 'postOffice', 'village'] as const;

export type PlaceLevel = (typeof PLACE_LEVELS)[number];

export type PlaceScope = Partial<Record<PlaceLevel, string>>;

export type PlaceDrill = {
  level: PlaceLevel;
  id: string;
  name: string;
};

export type AnalyticsRequisitionRow = {
  id: string;
  farmerId: string;
  shortName: string;
  accountNumber: string;
  familyKey: string;
  familyLabel: string;
  varietyName: string;
  acres: number;
  places: Record<PlaceLevel, string>;
};

export type StationAnalytics = {
  stationId: string;
  name: string;
  acres: number;
  sharePct: number;
  cumulativePct: number;
  isHot: boolean;
  farmers: number;
  familyGroups: number;
  acresPerFarmer: number;
  byVariety: Record<string, number>;
  requisitions: AnalyticsRequisitionRow[];
  childLevel: PlaceLevel | null;
};

export type VarietyAnalytics = {
  varietyId: string;
  name: string;
  acres: number;
  sharePct: number;
  farmers: number;
  stations: number;
  topStation: { name: string; sharePct: number };
  avgAcresPerRequisition: number;
};

export type FamilyAnalytics = {
  key: string;
  label: string;
  accounts: number;
  stationName: string;
  acres: number;
  sharePct: number;
  byVariety: Record<string, number>;
};

export type GeographyAnalytics = {
  state: string[];
  district: string[];
  station: string[];
  pincode: string[];
  postOffices: string[];
};

export type DataHealthRow = {
  id: string;
  primary: string;
  secondary: string;
};

export type DataHealthFinding = {
  id: string;
  severity: 'warn' | 'info';
  title: string;
  detail: string;
  count: number;
  rows: DataHealthRow[];
};

export type RequisitionAnalytics = {
  placeLevel: PlaceLevel;
  totals: {
    acres: number;
    requisitions: number;
    farmers: number;
    familyGroups: number;
    stations: number;
    fulfilledAcres: number;
    avgAcresPerFarmer: number;
  };
  stations: StationAnalytics[];
  varieties: VarietyAnalytics[];
  families: FamilyAnalytics[];
  geography: GeographyAnalytics;
  dataHealth: DataHealthFinding[];
};

type InternalRow = {
  id: string;
  acres: number;
  fulfilledAcres: number;
  requestedBags: number | null;
  farmerId: string;
  familyId: string | null;
  familyKey: string;
  accountType: string;
  fullName: string;
  shortName: string;
  accountNumber: string;
  varietyId: string;
  varietyName: string;
  villageId: string;
  villageName: string;
  policeStationId: string;
  policeStationName: string;
  postOfficeId: string;
  panNumber: string | null;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  mobileNumber: string;
  hindiContractUrl: string | null;
  postOfficeName: string;
  stateName: string;
  districtName: string;
  stationId: string;
  stationName: string;
  pincodeName: string;
  rejected: boolean;
};

function parseAcres(value: string | null | undefined): number {
  if (value == null) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortName(name: string): string {
  const [head] = name.split(RELATION_SPLIT);
  return (head ?? name).trim();
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

function normalizeKey(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '').toLowerCase();
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()))].sort((a, b) => a.localeCompare(b));
}

function fatherToken(name: string): string | null {
  const match = name.match(FATHER_PATTERN);
  if (!match?.[1]) return null;
  return match[1].trim().replace(/\s+/g, ' ').toLowerCase() || null;
}

function toInternal(requisition: SeedRequisition): InternalRow {
  const farmer = requisition.farmer;
  const farmerId = requisition.farmerId || farmer?.id || requisition.id;
  const familyId = blankToNull(farmer?.familyId);
  const villageName = getRequisitionVillageName(farmer) || 'Unknown';
  const villageId = farmer?.villageId || farmer?.village?.id || `name:${villageName}`;
  const stationName = farmer?.station?.name?.trim() || 'Unknown';
  const stationId = farmer?.stationId || farmer?.station?.id || `name:${stationName}`;
  const policeStationName =
    farmer?.policeStation?.name?.trim() ||
    farmer?.area?.policeStation?.name?.trim() ||
    farmer?.area?.village?.policeStation?.name?.trim() ||
    'Unknown';
  const policeStationId =
    farmer?.policeStationId || farmer?.policeStation?.id || `name:${policeStationName}`;
  const postOfficeName =
    farmer?.postOffice?.name?.trim() ||
    farmer?.area?.postOffice?.name?.trim() ||
    farmer?.area?.village?.policeStation?.postOffice?.name?.trim() ||
    '';
  const postOfficeId =
    farmer?.postOfficeId || farmer?.postOffice?.id || `name:${postOfficeName || 'Unknown'}`;
  const fullName = farmer?.name?.trim() || 'Unknown';

  return {
    id: requisition.id,
    acres: parseAcres(requisition.requestedAcres),
    fulfilledAcres: parseAcres(requisition.fulfilledAcres),
    requestedBags: requisition.requestedBags,
    farmerId,
    familyId,
    familyKey: familyId ?? farmerId,
    accountType: farmer?.accountType?.trim() ?? '',
    fullName,
    shortName: shortName(fullName),
    accountNumber: farmer?.accountNumber?.trim() || '—',
    varietyId:
      requisition.varietyId || requisition.variety?.id || requisition.variety?.name || 'unknown',
    varietyName: requisition.variety?.name?.trim() || 'Unknown',
    villageId,
    villageName,
    policeStationId,
    policeStationName,
    postOfficeId,
    panNumber: blankToNull(farmer?.panNumber),
    bankAccountNumber: farmer?.bankAccountNumber?.trim() ?? '',
    bankName: farmer?.bankName?.trim() ?? '',
    ifscCode: farmer?.ifscCode?.trim() ?? '',
    mobileNumber: farmer?.mobileNumber?.trim() ?? '',
    hindiContractUrl: blankToNull(requisition.hindiContractUrl),
    postOfficeName,
    stateName:
      farmer?.state?.name?.trim() ||
      farmer?.area?.state?.name?.trim() ||
      farmer?.area?.village?.policeStation?.postOffice?.district?.state?.name?.trim() ||
      '',
    districtName: getRequisitionDistrictName(farmer),
    stationId,
    stationName,
    pincodeName: farmer?.pincode?.name?.trim() ?? '',
    rejected: requisition.status === 'REJECTED',
  };
}

function applyRank<T extends { acres: number }>(
  sorted: T[],
  totalAcres: number,
): Array<T & { sharePct: number; cumulativePct: number; isHot: boolean }> {
  let running = 0;
  let hotCount = 0;
  let hotOpen = sorted.length > 0;

  return sorted.map((item) => {
    const sharePct = totalAcres > 0 ? (item.acres / totalAcres) * 100 : 0;
    running += sharePct;
    let isHot = false;
    if (hotOpen && hotCount < HOT_MAX) {
      isHot = true;
      hotCount += 1;
      if (running >= HOT_SHARE) hotOpen = false;
    }
    return { ...item, sharePct, cumulativePct: running, isHot };
  });
}

function familyLabels(rows: InternalRow[]): Map<string, string> {
  const members = new Map<string, { farmerId: string; shortName: string; accountType: string }[]>();
  for (const row of rows) {
    const group = members.get(row.familyKey) ?? [];
    if (!group.some((member) => member.farmerId === row.farmerId)) {
      group.push({
        farmerId: row.farmerId,
        shortName: row.shortName,
        accountType: row.accountType,
      });
    }
    members.set(row.familyKey, group);
  }

  const labels = new Map<string, string>();
  for (const [key, group] of members) {
    const primary = group.find((member) => member.accountType === 'FAMILY_PRIMARY');
    labels.set(key, (primary ?? group[0])?.shortName || 'Unknown');
  }
  return labels;
}

function placeOf(row: InternalRow, level: PlaceLevel): { id: string; name: string } {
  switch (level) {
    case 'station':
      return { id: row.stationId, name: row.stationName };
    case 'policeStation':
      return { id: row.policeStationId, name: row.policeStationName };
    case 'postOffice':
      return { id: row.postOfficeId, name: row.postOfficeName || 'Unknown' };
    case 'village':
      return { id: row.villageId, name: row.villageName };
  }
}

function placesOf(row: InternalRow): Record<PlaceLevel, string> {
  return {
    station: row.stationId,
    policeStation: row.policeStationId,
    postOffice: row.postOfficeId,
    village: row.villageId,
  };
}

function childLevelFromPlaces(
  rows: Array<{ places: Record<PlaceLevel, string> }>,
  after: PlaceLevel | null,
): PlaceLevel | null {
  const start = after == null ? 0 : PLACE_LEVELS.indexOf(after) + 1;
  for (let index = start; index < PLACE_LEVELS.length; index += 1) {
    const level = PLACE_LEVELS[index];
    if (!level) continue;
    const ids = new Set(rows.map((row) => row.places[level]));
    if (ids.size >= 2) return level;
  }
  return null;
}

export function placeLevelLabel(level: PlaceLevel, plural = false): string {
  const labels: Record<PlaceLevel, [string, string]> = {
    station: ['station', 'stations'],
    policeStation: ['police station', 'police stations'],
    postOffice: ['post office', 'post offices'],
    village: ['village', 'villages'],
  };
  return labels[level][plural ? 1 : 0];
}

export function nextPlaceLevel(
  requisitions: SeedRequisition[],
  after: PlaceLevel | null,
): PlaceLevel | null {
  const rows = requisitions
    .map(toInternal)
    .filter((row) => !row.rejected)
    .map((row) => ({ places: placesOf(row) }));
  return childLevelFromPlaces(rows, after);
}

export function requisitionsInScope(
  requisitions: SeedRequisition[],
  scope: PlaceScope,
): SeedRequisition[] {
  const selected = PLACE_LEVELS.flatMap((level) => {
    const id = scope[level];
    return id ? [{ level, id }] : [];
  });
  if (selected.length === 0) return requisitions;
  return requisitions.filter((requisition) => {
    const places = placesOf(toInternal(requisition));
    return selected.every((place) => places[place.level] === place.id);
  });
}

function toRequisitionRow(row: InternalRow, labels: Map<string, string>): AnalyticsRequisitionRow {
  return {
    id: row.id,
    farmerId: row.farmerId,
    shortName: row.shortName,
    accountNumber: row.accountNumber,
    familyKey: row.familyKey,
    familyLabel: labels.get(row.familyKey) ?? row.shortName,
    varietyName: row.varietyName,
    acres: row.acres,
    places: placesOf(row),
  };
}

function buildStations(
  rows: InternalRow[],
  labels: Map<string, string>,
  level: PlaceLevel,
): StationAnalytics[] {
  const buckets = new Map<
    string,
    {
      stationId: string;
      name: string;
      acres: number;
      farmerIds: Set<string>;
      familyKeys: Set<string>;
      byVariety: Record<string, number>;
      requisitions: AnalyticsRequisitionRow[];
    }
  >();

  for (const row of rows) {
    const place = placeOf(row, level);
    const bucket = buckets.get(place.id) ?? {
      stationId: place.id,
      name: place.name,
      acres: 0,
      farmerIds: new Set<string>(),
      familyKeys: new Set<string>(),
      byVariety: {},
      requisitions: [],
    };
    bucket.acres += row.acres;
    bucket.farmerIds.add(row.farmerId);
    bucket.familyKeys.add(row.familyKey);
    bucket.byVariety[row.varietyName] = (bucket.byVariety[row.varietyName] ?? 0) + row.acres;
    bucket.requisitions.push(toRequisitionRow(row, labels));
    buckets.set(place.id, bucket);
  }

  const totalAcres = [...buckets.values()].reduce((sum, bucket) => sum + bucket.acres, 0);
  const sorted = [...buckets.values()].sort(
    (a, b) => b.acres - a.acres || a.name.localeCompare(b.name),
  );

  return applyRank(sorted, totalAcres).map((bucket) => ({
    stationId: bucket.stationId,
    name: bucket.name,
    acres: bucket.acres,
    sharePct: bucket.sharePct,
    cumulativePct: bucket.cumulativePct,
    isHot: bucket.isHot,
    farmers: bucket.farmerIds.size,
    familyGroups: bucket.familyKeys.size,
    acresPerFarmer: bucket.farmerIds.size > 0 ? bucket.acres / bucket.farmerIds.size : 0,
    byVariety: bucket.byVariety,
    requisitions: bucket.requisitions,
    childLevel: childLevelFromPlaces(bucket.requisitions, level),
  }));
}

function buildVarieties(
  rows: InternalRow[],
  totalAcres: number,
  level: PlaceLevel,
): VarietyAnalytics[] {
  const buckets = new Map<
    string,
    {
      varietyId: string;
      name: string;
      acres: number;
      count: number;
      farmerIds: Set<string>;
      stationIds: Set<string>;
      stationAcres: Map<string, { name: string; acres: number }>;
    }
  >();

  for (const row of rows) {
    const bucket = buckets.get(row.varietyId) ?? {
      varietyId: row.varietyId,
      name: row.varietyName,
      acres: 0,
      count: 0,
      farmerIds: new Set<string>(),
      stationIds: new Set<string>(),
      stationAcres: new Map<string, { name: string; acres: number }>(),
    };
    bucket.acres += row.acres;
    bucket.count += 1;
    bucket.farmerIds.add(row.farmerId);
    const place = placeOf(row, level);
    bucket.stationIds.add(place.id);
    const station = bucket.stationAcres.get(place.id) ?? { name: place.name, acres: 0 };
    station.acres += row.acres;
    bucket.stationAcres.set(place.id, station);
    buckets.set(row.varietyId, bucket);
  }

  return [...buckets.values()]
    .map((bucket) => {
      let topName = '—';
      let topAcres = 0;
      for (const station of bucket.stationAcres.values()) {
        if (
          station.acres > topAcres ||
          (station.acres === topAcres && station.name.localeCompare(topName) < 0)
        ) {
          topAcres = station.acres;
          topName = station.name;
        }
      }
      return {
        varietyId: bucket.varietyId,
        name: bucket.name,
        acres: bucket.acres,
        sharePct: totalAcres > 0 ? (bucket.acres / totalAcres) * 100 : 0,
        farmers: bucket.farmerIds.size,
        stations: bucket.stationIds.size,
        topStation: {
          name: topName,
          sharePct: bucket.acres > 0 ? (topAcres / bucket.acres) * 100 : 0,
        },
        avgAcresPerRequisition: bucket.count > 0 ? bucket.acres / bucket.count : 0,
      };
    })
    .sort((a, b) => b.acres - a.acres || a.name.localeCompare(b.name));
}

function buildFamilies(
  rows: InternalRow[],
  labels: Map<string, string>,
  totalAcres: number,
  level: PlaceLevel,
): FamilyAnalytics[] {
  const buckets = new Map<
    string,
    {
      key: string;
      farmerIds: Set<string>;
      acres: number;
      byVariety: Record<string, number>;
      stationAcres: Map<string, number>;
    }
  >();

  for (const row of rows) {
    const bucket = buckets.get(row.familyKey) ?? {
      key: row.familyKey,
      farmerIds: new Set<string>(),
      acres: 0,
      byVariety: {},
      stationAcres: new Map<string, number>(),
    };
    bucket.acres += row.acres;
    bucket.farmerIds.add(row.farmerId);
    bucket.byVariety[row.varietyName] = (bucket.byVariety[row.varietyName] ?? 0) + row.acres;
    const placeName = placeOf(row, level).name;
    bucket.stationAcres.set(placeName, (bucket.stationAcres.get(placeName) ?? 0) + row.acres);
    buckets.set(row.familyKey, bucket);
  }

  return [...buckets.values()]
    .map((bucket) => {
      let stationName = '—';
      let stationAcres = -1;
      for (const [name, acres] of bucket.stationAcres) {
        if (
          acres > stationAcres ||
          (acres === stationAcres && name.localeCompare(stationName) < 0)
        ) {
          stationAcres = acres;
          stationName = name;
        }
      }
      return {
        key: bucket.key,
        label: labels.get(bucket.key) ?? 'Unknown',
        accounts: bucket.farmerIds.size,
        stationName,
        acres: bucket.acres,
        sharePct: totalAcres > 0 ? (bucket.acres / totalAcres) * 100 : 0,
        byVariety: bucket.byVariety,
      };
    })
    .sort((a, b) => b.acres - a.acres || a.label.localeCompare(b.label));
}

function farmerRows(rows: InternalRow[]): InternalRow[] {
  const byFarmer = new Map<string, InternalRow>();
  for (const row of rows) {
    if (!byFarmer.has(row.farmerId)) byFarmer.set(row.farmerId, row);
  }
  return [...byFarmer.values()];
}

function healthRow(row: InternalRow): DataHealthRow {
  return { id: row.farmerId, primary: row.shortName, secondary: row.accountNumber };
}

function buildDataHealth(rows: InternalRow[]): DataHealthFinding[] {
  const findings: DataHealthFinding[] = [];
  const farmers = farmerRows(rows);

  const bankGroups = new Map<string, InternalRow[]>();
  for (const farmer of farmers) {
    const key = farmer.bankAccountNumber.replace(/\s+/g, '').toUpperCase();
    if (key.length < 4) continue;
    const group = bankGroups.get(key) ?? [];
    group.push(farmer);
    bankGroups.set(key, group);
  }
  const duplicateBankFarmers = [...bankGroups.values()]
    .filter((group) => new Set(group.map((farmer) => farmer.farmerId)).size >= 2)
    .flat();
  if (duplicateBankFarmers.length > 0) {
    findings.push({
      id: 'duplicate-bank-account',
      severity: 'warn',
      title: 'Duplicate bank account',
      detail: 'The same bank account is used by more than one farmer.',
      count: duplicateBankFarmers.length,
      rows: duplicateBankFarmers.map(healthRow),
    });
  }

  const ifscMismatches = farmers.filter((farmer) => {
    const prefix = farmer.ifscCode
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 4)
      .toUpperCase();
    const expected = IFSC_BANKS[prefix];
    if (!expected || !farmer.bankName) return false;
    const bank = normalizeKey(farmer.bankName);
    const target = normalizeKey(expected);
    return !bank.includes(target) && !target.includes(bank);
  });
  if (ifscMismatches.length > 0) {
    findings.push({
      id: 'ifsc-bank-mismatch',
      severity: 'warn',
      title: 'Bank name does not match IFSC',
      detail: 'The bank name does not match the bank implied by the IFSC prefix.',
      count: ifscMismatches.length,
      rows: ifscMismatches.map(healthRow),
    });
  }

  const missingPan = farmers.filter((farmer) => !farmer.panNumber);
  if (missingPan.length > 0) {
    findings.push({
      id: 'missing-pan',
      severity: 'warn',
      title: 'Missing PAN',
      detail: 'These farmers have no PAN on file.',
      count: missingPan.length,
      rows: missingPan.map(healthRow),
    });
  }

  const missingHindi = rows.filter((row) => !row.hindiContractUrl);
  if (missingHindi.length > 0) {
    findings.push({
      id: 'missing-hindi-contract',
      severity: 'warn',
      title: 'Missing Hindi contract',
      detail: 'These requisitions have no Hindi contract.',
      count: missingHindi.length,
      rows: missingHindi.map((row) => ({
        id: row.id,
        primary: row.shortName,
        secondary: `${row.accountNumber} · ${row.varietyName}`,
      })),
    });
  }

  if (rows.length > 0 && rows.every((row) => row.requestedBags == null)) {
    findings.push({
      id: 'bags-empty',
      severity: 'info',
      title: 'Bag quantities are empty',
      detail: "Bag-based planning isn't possible yet — requestedBags is empty.",
      count: rows.length,
      rows: [],
    });
  }

  const mobiles = new Map<string, Set<string>>();
  for (const farmer of farmers) {
    const mobile = farmer.mobileNumber.replace(/\D/g, '');
    if (mobile.length < 10) continue;
    const groups = mobiles.get(mobile) ?? new Set<string>();
    groups.add(farmer.familyKey);
    mobiles.set(mobile, groups);
  }
  const sharedMobiles = new Set(
    [...mobiles.entries()].filter(([, groups]) => groups.size >= 2).map(([mobile]) => mobile),
  );
  const sharedMobileFarmers = farmers.filter((farmer) =>
    sharedMobiles.has(farmer.mobileNumber.replace(/\D/g, '')),
  );
  if (sharedMobileFarmers.length > 0) {
    findings.push({
      id: 'shared-mobile',
      severity: 'warn',
      title: 'Mobile number shared across families',
      detail: 'The same mobile number is used by different family groups.',
      count: sharedMobileFarmers.length,
      rows: sharedMobileFarmers.map(healthRow),
    });
  }

  const postOfficesByVillage = new Map<string, { name: string; postOffices: Set<string> }>();
  for (const row of rows) {
    if (!row.postOfficeName) continue;
    const entry = postOfficesByVillage.get(row.villageId) ?? {
      name: row.villageName,
      postOffices: new Set<string>(),
    };
    entry.postOffices.add(row.postOfficeName);
    postOfficesByVillage.set(row.villageId, entry);
  }
  const multiPostOffice = [...postOfficesByVillage.entries()].filter(
    ([, entry]) => entry.postOffices.size >= 2,
  );
  if (multiPostOffice.length > 0) {
    findings.push({
      id: 'village-post-offices',
      severity: 'warn',
      title: 'Village mapped to more than one post office',
      detail: 'These villages are linked to more than one post office.',
      count: multiPostOffice.length,
      rows: multiPostOffice.map(([villageId, entry]) => ({
        id: villageId,
        primary: entry.name,
        secondary: [...entry.postOffices].sort((a, b) => a.localeCompare(b)).join(', '),
      })),
    });
  }

  const linkedFathers = new Map<string, Set<string>>();
  for (const farmer of farmers) {
    if (!farmer.familyId) continue;
    const father = fatherToken(farmer.fullName);
    if (!father) continue;
    const fathers = linkedFathers.get(farmer.villageId) ?? new Set<string>();
    fathers.add(father);
    linkedFathers.set(farmer.villageId, fathers);
  }
  const unlinked = farmers.filter((farmer) => {
    if (farmer.familyId) return false;
    const father = fatherToken(farmer.fullName);
    if (!father) return false;
    return linkedFathers.get(farmer.villageId)?.has(father) ?? false;
  });
  if (unlinked.length > 0) {
    findings.push({
      id: 'possible-unlinked-family',
      severity: 'info',
      title: 'Possible unlinked family',
      detail:
        'Worth checking: a farmer has no family link but shares an S/O name with a linked family in the same village.',
      count: unlinked.length,
      rows: unlinked.map(healthRow),
    });
  }

  return findings;
}

export function computeRequisitionAnalytics(
  requisitions: SeedRequisition[],
  options?: { groupBy?: PlaceLevel },
): RequisitionAnalytics {
  const groupBy = options?.groupBy ?? 'station';
  const rows = requisitions.map(toInternal);
  const demand = rows.filter((row) => !row.rejected);
  const labels = familyLabels(demand);
  const totalAcres = demand.reduce((sum, row) => sum + row.acres, 0);
  const farmerIds = new Set(demand.map((row) => row.farmerId));
  const stations = buildStations(demand, labels, groupBy);

  return {
    placeLevel: groupBy,
    totals: {
      acres: totalAcres,
      requisitions: demand.length,
      farmers: farmerIds.size,
      familyGroups: new Set(demand.map((row) => row.familyKey)).size,
      stations: stations.length,
      fulfilledAcres: demand.reduce((sum, row) => sum + row.fulfilledAcres, 0),
      avgAcresPerFarmer: farmerIds.size > 0 ? totalAcres / farmerIds.size : 0,
    },
    stations,
    varieties: buildVarieties(demand, totalAcres, groupBy),
    families: buildFamilies(demand, labels, totalAcres, groupBy),
    geography: {
      state: sortedUnique(demand.map((row) => row.stateName)),
      district: sortedUnique(demand.map((row) => row.districtName)),
      station: sortedUnique(demand.map((row) => row.stationName)),
      pincode: sortedUnique(demand.map((row) => row.pincodeName)),
      postOffices: sortedUnique(demand.map((row) => row.postOfficeName)),
    },
    dataHealth: buildDataHealth(rows),
  };
}

export function rankStations(
  stations: StationAnalytics[],
  varietyName: string | null,
  level: PlaceLevel = 'station',
): StationAnalytics[] {
  if (!varietyName) return stations;

  const filtered = stations.flatMap((station) => {
    const requisitions = station.requisitions.filter((row) => row.varietyName === varietyName);
    const acres = requisitions.reduce((sum, row) => sum + row.acres, 0);
    if (acres <= 0) return [];
    const farmers = new Set(requisitions.map((row) => row.farmerId));
    const familyGroups = new Set(requisitions.map((row) => row.familyKey));
    return [
      {
        stationId: station.stationId,
        name: station.name,
        acres,
        sharePct: 0,
        cumulativePct: 0,
        isHot: false,
        farmers: farmers.size,
        familyGroups: familyGroups.size,
        acresPerFarmer: farmers.size > 0 ? acres / farmers.size : 0,
        byVariety: { [varietyName]: acres },
        requisitions,
        childLevel: childLevelFromPlaces(requisitions, level),
      },
    ];
  });

  const totalAcres = filtered.reduce((sum, station) => sum + station.acres, 0);
  const sorted = filtered.sort((a, b) => b.acres - a.acres || a.name.localeCompare(b.name));
  return applyRank(sorted, totalAcres);
}

export function limitStations(stations: StationAnalytics[], limit = 10): StationAnalytics[] {
  if (stations.length <= limit) return stations;
  const rest = stations.slice(limit);
  const requisitions = rest.flatMap((station) => station.requisitions);
  const acres = rest.reduce((sum, station) => sum + station.acres, 0);
  const byVariety: Record<string, number> = {};
  for (const station of rest) {
    for (const [name, value] of Object.entries(station.byVariety)) {
      byVariety[name] = (byVariety[name] ?? 0) + value;
    }
  }
  const farmers = new Set(requisitions.map((row) => row.farmerId));
  const familyGroups = new Set(requisitions.map((row) => row.familyKey));

  return [
    ...stations.slice(0, limit),
    {
      stationId: '__other__',
      name: 'Other',
      acres,
      sharePct: rest.reduce((sum, station) => sum + station.sharePct, 0),
      cumulativePct: 100,
      isHot: false,
      farmers: farmers.size,
      familyGroups: familyGroups.size,
      acresPerFarmer: farmers.size > 0 ? acres / farmers.size : 0,
      byVariety,
      requisitions,
      childLevel: null,
    },
  ];
}
