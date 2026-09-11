import { formatContractAcres } from '@/features/farmers/contract/types';
import type { Farmer } from '@/features/farmers/overview/types';

export const UNASSIGNED_AREA = 'Unassigned';
export const UNSPECIFIED_VARIETY = 'Unspecified';
export const AREA_SHARE_DONUT_MAX = 6;
export const MAX_INSIGHTS = 5;
export const CONCENTRATION_SHARE = 0.7;

export type NamedAcres = {
  name: string;
  acres: number;
  share: number;
};

export type ContractAnalytics = {
  totalContracts: number;
  totalAcres: number;
  totalFarmers: number;
  totalVarieties: number;
  topArea: NamedAcres | null;
  topVariety: NamedAcres | null;
  byArea: NamedAcres[];
  byVariety: NamedAcres[];
  areaNames: string[];
  varietyNames: string[];
  cellAcres: Record<string, Record<string, number>>;
  maxCellAcres: number;
  insights: string[];
};

type ContractFact = {
  farmerId: string;
  variety: string;
  area: string;
  locality: string;
  acres: number | null;
};

export function parseContractAcres(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function formatAcresWithUnit(acres: number): string {
  return `${formatContractAcres(acres)} ac`;
}

export function formatSharePercent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

export function resolveAreaName(farmer: Pick<Farmer, 'station' | 'stationId'>): string {
  const name = farmer.station?.name?.trim();
  if (name) return name;
  const stationId = farmer.stationId?.trim();
  if (stationId) return stationId;
  return UNASSIGNED_AREA;
}

export function resolveVarietyName(variety: string | null | undefined): string {
  const name = variety?.trim();
  return name ? name : UNSPECIFIED_VARIETY;
}

function resolveLocalityName(farmer: Pick<Farmer, 'locality' | 'localityId'>): string {
  const name = farmer.locality?.name?.trim();
  if (name) return name;
  return farmer.localityId?.trim() ?? '';
}

function collectContractFacts(farmers: Farmer[]): ContractFact[] {
  const facts: ContractFact[] = [];
  for (const farmer of farmers) {
    for (const contract of farmer.contracts ?? []) {
      facts.push({
        farmerId: farmer.id,
        variety: resolveVarietyName(contract.variety),
        area: resolveAreaName(farmer),
        locality: resolveLocalityName(farmer),
        acres: parseContractAcres(contract.acres),
      });
    }
  }
  return facts;
}

function toNamedAcres(totals: Map<string, number>, totalAcres: number): NamedAcres[] {
  return [...totals.entries()]
    .map(([name, acres]) => ({
      name,
      acres,
      share: totalAcres > 0 ? acres / totalAcres : 0,
    }))
    .sort((a, b) => b.acres - a.acres || a.name.localeCompare(b.name));
}

function uniqueSorted(names: Iterable<string>): string[] {
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

export function buildContractInsights(analytics: Omit<ContractAnalytics, 'insights'>): string[] {
  if (analytics.totalAcres <= 0 || analytics.totalContracts < 2) return [];

  const insights: string[] = [];
  const { topArea, topVariety, byArea, byVariety, cellAcres } = analytics;

  if (topArea && topArea.acres > 0) {
    insights.push(
      `${topArea.name} contributes the highest contracted acreage with ${formatContractAcres(topArea.acres)} acres.`,
    );
  }

  if (topVariety && topVariety.acres > 0) {
    insights.push(`${topVariety.name} is currently the most contracted variety.`);
  }

  if (byArea.length >= 2 && insights.length < MAX_INSIGHTS) {
    const topTwoShare = byArea[0].share + byArea[1].share;
    insights.push(
      `${formatSharePercent(topTwoShare)} of total contracted acreage comes from the top 2 areas.`,
    );
  }

  if (topVariety && insights.length < MAX_INSIGHTS) {
    const areasWithVariety = byArea.filter(
      (area) => (cellAcres[area.name]?.[topVariety.name] ?? 0) > 0,
    );
    if (areasWithVariety.length >= 2) {
      let strongest = areasWithVariety[0];
      let strongestAcres = cellAcres[strongest.name]?.[topVariety.name] ?? 0;
      let tied = false;
      for (const area of areasWithVariety.slice(1)) {
        const acres = cellAcres[area.name]?.[topVariety.name] ?? 0;
        if (acres > strongestAcres) {
          strongest = area;
          strongestAcres = acres;
          tied = false;
        } else if (acres === strongestAcres) {
          tied = true;
        }
      }
      if (!tied && strongestAcres > 0) {
        insights.push(`${topVariety.name} has the strongest presence in ${strongest.name}.`);
      }
    }
  }

  if (byVariety.length >= 2 && insights.length < MAX_INSIGHTS) {
    const concentrated = byArea.find((area) => {
      if (area.share < 0.2 || area.acres <= 0) return false;
      const varieties = Object.values(cellAcres[area.name] ?? {});
      const areaTotal = varieties.reduce((sum, acres) => sum + acres, 0);
      if (areaTotal <= 0) return false;
      const dominant = Math.max(...varieties);
      return dominant / areaTotal >= CONCENTRATION_SHARE;
    });
    if (concentrated) {
      insights.push(
        `${concentrated.name} has high acreage but is concentrated around a single variety.`,
      );
    }
  }

  return insights.slice(0, MAX_INSIGHTS);
}

export function buildContractAnalytics(farmers: Farmer[]): ContractAnalytics {
  const facts = collectContractFacts(farmers);
  const totalContracts = facts.length;
  const farmerIds = new Set<string>();
  const varietyNames = new Set<string>();
  const acresByArea = new Map<string, number>();
  const acresByVariety = new Map<string, number>();
  const cellAcres: Record<string, Record<string, number>> = {};
  let totalAcres = 0;
  let maxCellAcres = 0;

  for (const fact of facts) {
    farmerIds.add(fact.farmerId);
    varietyNames.add(fact.variety);
    if (fact.acres === null) continue;

    totalAcres += fact.acres;
    acresByArea.set(fact.area, (acresByArea.get(fact.area) ?? 0) + fact.acres);
    acresByVariety.set(fact.variety, (acresByVariety.get(fact.variety) ?? 0) + fact.acres);

    const areaCells = cellAcres[fact.area] ?? {};
    const cellValue = (areaCells[fact.variety] ?? 0) + fact.acres;
    areaCells[fact.variety] = cellValue;
    cellAcres[fact.area] = areaCells;
    if (cellValue > maxCellAcres) maxCellAcres = cellValue;
  }

  const byArea = toNamedAcres(acresByArea, totalAcres);
  const byVariety = toNamedAcres(acresByVariety, totalAcres);
  const areaNames = byArea.map((item) => item.name);
  const remainingAreas = uniqueSorted(Object.keys(cellAcres)).filter(
    (name) => !areaNames.includes(name),
  );

  const analyticsWithoutInsights: Omit<ContractAnalytics, 'insights'> = {
    totalContracts,
    totalAcres,
    totalFarmers: farmerIds.size,
    totalVarieties: varietyNames.size,
    topArea: byArea[0] ?? null,
    topVariety: byVariety[0] ?? null,
    byArea,
    byVariety,
    areaNames: [...areaNames, ...remainingAreas],
    varietyNames: byVariety.map((item) => item.name),
    cellAcres,
    maxCellAcres,
  };

  return {
    ...analyticsWithoutInsights,
    insights: buildContractInsights(analyticsWithoutInsights),
  };
}
