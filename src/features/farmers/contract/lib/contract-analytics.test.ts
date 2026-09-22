import { describe, expect, it } from 'vitest';
import type { FarmerContract } from '@/features/farmers/contract/types';
import type { Farmer, FarmerArea } from '@/features/farmers/overview/types';
import {
  buildContractAnalytics,
  formatAcresWithUnit,
  parseContractAcres,
  resolveAreaName,
  resolveVarietyName,
  UNASSIGNED_AREA,
  UNSPECIFIED_VARIETY,
} from './contract-analytics';

function contract(
  overrides: Partial<FarmerContract> & Pick<FarmerContract, 'id' | 'variety' | 'acres'>,
): FarmerContract {
  return {
    date: '2026-01-01',
    contractUrl: '',
    hindiContractUrl: '',
    isNotarized: false,
    ...overrides,
  };
}

function districtArea(district: string, village = 'Village'): FarmerArea {
  return {
    id: `area-${district}`,
    name: village,
    villageId: `village-${village}`,
    village: {
      id: `village-${village}`,
      name: village,
      policeStation: {
        id: `ps-${district}`,
        name: `${district} PS`,
        postOffice: {
          id: `po-${district}`,
          name: `${district} PO`,
          pincode: '244713',
          district: {
            id: `district-${district}`,
            name: district,
            state: { id: 'state-uk', name: 'Uttarakhand' },
          },
        },
      },
    },
  };
}

function farmer(overrides: Partial<Farmer> & Pick<Farmer, 'id' | 'name'>): Farmer {
  return {
    accountNumber: '',
    mobileNumber: '',
    aadharNumber: null,
    panNumber: null,
    accountType: 'INDIVIDUAL',
    status: 'ACTIVE',
    areaId: '',
    familyId: null,
    contractUrl: null,
    bankName: null,
    ifscCode: null,
    bankAccountNumber: null,
    ...overrides,
  };
}

describe('parseContractAcres', () => {
  it('parses numeric strings and numbers', () => {
    expect(parseContractAcres('5.75')).toBe(5.75);
    expect(parseContractAcres(3.25)).toBe(3.25);
    expect(parseContractAcres('0')).toBe(0);
  });

  it('ignores invalid acreage', () => {
    expect(parseContractAcres('')).toBeNull();
    expect(parseContractAcres('abc')).toBeNull();
    expect(parseContractAcres(Number.NaN)).toBeNull();
    expect(parseContractAcres(Number.POSITIVE_INFINITY)).toBeNull();
    expect(parseContractAcres(-1)).toBeNull();
    expect(parseContractAcres(null)).toBeNull();
    expect(parseContractAcres(undefined)).toBeNull();
  });
});

describe('resolveAreaName / resolveVarietyName', () => {
  it('uses district name, then Unassigned', () => {
    expect(resolveAreaName({ area: districtArea('BANDA') })).toBe('BANDA');
    expect(resolveAreaName({ area: null })).toBe(UNASSIGNED_AREA);
    expect(resolveAreaName({ area: undefined })).toBe(UNASSIGNED_AREA);
  });

  it('falls back to Unspecified for blank varieties', () => {
    expect(resolveVarietyName('Kufri Jyoti')).toBe('Kufri Jyoti');
    expect(resolveVarietyName('  ')).toBe(UNSPECIFIED_VARIETY);
    expect(resolveVarietyName(undefined)).toBe(UNSPECIFIED_VARIETY);
  });
});

describe('formatAcresWithUnit', () => {
  it('avoids trailing zeros', () => {
    expect(formatAcresWithUnit(5.75)).toBe('5.75 ac');
    expect(formatAcresWithUnit(5.75)).not.toContain('5.7500');
    expect(formatAcresWithUnit(3)).toBe('3 ac');
  });
});

describe('buildContractAnalytics', () => {
  const sampleFarmers: Farmer[] = [
    farmer({
      id: 'f-baheri',
      name: 'Ramesh',
      area: districtArea('BAHERI'),
      contracts: [
        contract({ id: 'c1', variety: 'Kufri Jyoti', acres: '2.50' }),
        contract({ id: 'c2', variety: 'Kufri Bahar', acres: '1.25' }),
      ],
    }),
    farmer({
      id: 'f-banda',
      name: 'Sita',
      area: districtArea('BANDA'),
      contracts: [
        contract({ id: 'c3', variety: 'Kufri Pukhraj', acres: '4.00' }),
        contract({ id: 'c4', variety: 'Kufri Chipsona', acres: '1.75' }),
      ],
    }),
    farmer({
      id: 'f-bazpur',
      name: 'Amit',
      area: districtArea('BAZPUR'),
      contracts: [
        contract({ id: 'c5', variety: 'Kufri Jyoti', acres: '0.75' }),
        contract({ id: 'c6', variety: 'Kufri Chipsona', acres: '3.00' }),
      ],
    }),
    farmer({
      id: 'f-bilaspur',
      name: 'Geeta',
      area: districtArea('BILASPUR'),
      contracts: [contract({ id: 'c7', variety: 'Kufri Bahar', acres: '5.50' })],
    }),
    farmer({
      id: 'f-none',
      name: 'No contracts',
      area: districtArea('HALDWANI'),
      contracts: [],
    }),
    farmer({
      id: 'f-family',
      name: 'Family member',
      accountType: 'FAMILY_MEMBER',
      area: districtArea('BANDA'),
    }),
  ];

  it('aggregates contract-level acres by area and variety', () => {
    const analytics = buildContractAnalytics(sampleFarmers);

    expect(analytics.totalContracts).toBe(7);
    expect(analytics.totalFarmers).toBe(4);
    expect(analytics.totalVarieties).toBe(4);
    expect(analytics.totalAcres).toBe(18.75);
    expect(analytics.byArea.map((row) => [row.name, row.acres])).toEqual([
      ['BANDA', 5.75],
      ['BILASPUR', 5.5],
      ['BAHERI', 3.75],
      ['BAZPUR', 3.75],
    ]);
    expect(analytics.byVariety[0]).toMatchObject({ name: 'Kufri Bahar', acres: 6.75 });
    expect(analytics.cellAcres.BANDA['Kufri Pukhraj']).toBe(4);
    expect(analytics.cellAcres.BAHERI['Kufri Chipsona']).toBeUndefined();
    expect(analytics.topArea?.name).toBe('BANDA');
    expect(analytics.topVariety?.name).toBe('Kufri Bahar');
  });

  it('does not count farmers without contracts, including family members', () => {
    const analytics = buildContractAnalytics(sampleFarmers);
    expect(analytics.totalFarmers).toBe(4);
    expect(analytics.byArea.some((row) => row.name === 'HALDWANI')).toBe(false);
  });

  it('ignores invalid acres while still counting the contract', () => {
    const analytics = buildContractAnalytics([
      farmer({
        id: 'f1',
        name: 'One',
        area: districtArea('BANDA'),
        contracts: [
          contract({ id: 'good', variety: 'Kufri Jyoti', acres: '2' }),
          contract({ id: 'bad', variety: 'Kufri Bahar', acres: 'nope' }),
        ],
      }),
    ]);

    expect(analytics.totalContracts).toBe(2);
    expect(analytics.totalAcres).toBe(2);
    expect(analytics.totalVarieties).toBe(2);
    expect(analytics.byVariety.map((row) => row.name)).toEqual(['Kufri Jyoti']);
  });

  it('handles missing district and variety without throwing', () => {
    const analytics = buildContractAnalytics([
      farmer({
        id: 'f1',
        name: 'One',
        area: null,
        contracts: [contract({ id: 'c1', variety: '  ', acres: '1.5' })],
      }),
    ]);

    expect(analytics.byArea[0]?.name).toBe(UNASSIGNED_AREA);
    expect(analytics.byVariety[0]?.name).toBe(UNSPECIFIED_VARIETY);
    expect(analytics.totalAcres).toBe(1.5);
  });

  it('returns empty analytics for an empty farmer list', () => {
    const analytics = buildContractAnalytics([]);
    expect(analytics.totalContracts).toBe(0);
    expect(analytics.totalAcres).toBe(0);
    expect(analytics.insights).toEqual([]);
    expect(analytics.topArea).toBeNull();
  });

  it('skips insights for tiny datasets', () => {
    const analytics = buildContractAnalytics([
      farmer({
        id: 'f1',
        name: 'One',
        area: districtArea('BANDA'),
        contracts: [contract({ id: 'c1', variety: 'Kufri Jyoti', acres: '2' })],
      }),
    ]);
    expect(analytics.insights).toEqual([]);
  });

  it('emits only insights supported by the data', () => {
    const analytics = buildContractAnalytics(sampleFarmers);

    expect(analytics.insights).toContain(
      'BANDA contributes the highest contracted acreage with 5.75 acres.',
    );
    expect(analytics.insights).toContain('Kufri Bahar is currently the most contracted variety.');
    expect(analytics.insights.some((line) => line.includes('top 2 areas'))).toBe(true);
    expect(analytics.insights).toContain('Kufri Bahar has the strongest presence in BILASPUR.');
    expect(analytics.insights).toContain(
      'BILASPUR has high acreage but is concentrated around a single variety.',
    );
    expect(analytics.insights).toHaveLength(5);
  });

  it('does not claim a strongest area when a variety exists in only one area', () => {
    const analytics = buildContractAnalytics([
      farmer({
        id: 'f1',
        name: 'One',
        area: districtArea('BANDA'),
        contracts: [contract({ id: 'c1', variety: 'Kufri Jyoti', acres: '3' })],
      }),
      farmer({
        id: 'f2',
        name: 'Two',
        area: districtArea('BAHERI'),
        contracts: [contract({ id: 'c2', variety: 'Kufri Bahar', acres: '2' })],
      }),
    ]);

    expect(analytics.insights.some((line) => line.includes('strongest presence'))).toBe(false);
  });
});
