import { describe, expect, it } from 'vitest';
import {
  computeRequisitionAnalytics,
  nextPlaceLevel,
  rankStations,
  requisitionsInScope,
} from '@/features/seed-requisition/analytics/lib/compute-requisition-analytics';
import type {
  SeedRequisition,
  SeedRequisitionStatus,
} from '@/features/seed-requisition/overview/types';

function requisition(partial: {
  id: string;
  status?: SeedRequisitionStatus;
  requestedAcres?: string | null;
  fulfilledAcres?: string;
  farmerId?: string;
  familyId?: string | null;
  accountType?: string;
  name?: string;
  accountNumber?: string;
  panNumber?: string | null;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  mobileNumber?: string;
  aadharNumber?: string | null;
  hindiContractUrl?: string | null;
  villageId?: string;
  villageName?: string;
  stationId?: string;
  stationName?: string;
  varietyId?: string;
  varietyName?: string;
  remarks?: string;
}): SeedRequisition {
  const farmerId = partial.farmerId ?? partial.id;
  const villageId = partial.villageId ?? 'village-1';
  const stationId = partial.stationId ?? 'station-1';
  const stationName = partial.stationName ?? 'Khatima';
  return {
    id: partial.id,
    farmerId,
    varietyId: partial.varietyId ?? 'var-1',
    status: partial.status ?? 'PENDING',
    requestedBags: null,
    requestedAcres: partial.requestedAcres === undefined ? '0' : partial.requestedAcres,
    fulfilledBags: 0,
    fulfilledAcres: partial.fulfilledAcres ?? '0',
    requisitionDate: null,
    contractDate: null,
    engContractUrl: null,
    hindiContractUrl:
      partial.hindiContractUrl === undefined
        ? 'https://example.com/hi.pdf'
        : partial.hindiContractUrl,
    requestedDeliveryDate: null,
    approvedDeliveryDate: null,
    remarks: partial.remarks ?? null,
    rejectionRemarks: null,
    createdById: 'user',
    approvedById: null,
    rejectedById: null,
    approvedAt: null,
    rejectedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    farmer: {
      id: farmerId,
      name: partial.name ?? 'Farmer',
      accountNumber: partial.accountNumber ?? farmerId,
      mobileNumber: partial.mobileNumber ?? '9000000000',
      aadharNumber: partial.aadharNumber ?? null,
      panNumber: partial.panNumber === undefined ? 'ABCDE1234F' : partial.panNumber,
      bankName: partial.bankName ?? 'State Bank of India',
      bankAccountNumber: partial.bankAccountNumber ?? `BANK-${farmerId}`,
      ifscCode: partial.ifscCode ?? 'SBIN0001234',
      accountType: partial.accountType ?? 'INDIVIDUAL',
      familyId: partial.familyId === undefined ? null : partial.familyId,
      villageId,
      village: { id: villageId, name: partial.villageName ?? 'Keshowala' },
      state: { name: 'Uttarakhand' },
      district: { name: 'Udham Singh Nagar' },
      stationId,
      station: { id: stationId, name: stationName },
      postOffice: { name: 'Khatima' },
    },
    variety: {
      id: partial.varietyId ?? 'var-1',
      name: partial.varietyName ?? 'B101',
    },
  };
}

describe('computeRequisitionAnalytics', () => {
  it('parses acre strings, drops rejected demand, and groups null family ids separately', () => {
    const analytics = computeRequisitionAnalytics([
      requisition({
        id: 'a',
        farmerId: 'farmer-a',
        requestedAcres: '10.00',
        fulfilledAcres: '3.50',
        name: 'Ram Singh S/O Shyam',
        accountNumber: 'A-1',
      }),
      requisition({
        id: 'b',
        farmerId: 'farmer-b',
        requestedAcres: '2.50',
        name: 'Mohan Lal',
        accountNumber: 'A-2',
      }),
      requisition({
        id: 'c',
        farmerId: 'farmer-c',
        familyId: 'fam-1',
        accountType: 'FAMILY_PRIMARY',
        requestedAcres: '1.00',
        name: 'Sita Devi W/O Ram',
        accountNumber: 'A-3',
      }),
      requisition({
        id: 'd',
        farmerId: 'farmer-d',
        familyId: 'fam-1',
        accountType: 'FAMILY_MEMBER',
        requestedAcres: '1.00',
        name: 'Gita Devi W/O Ram',
        accountNumber: 'A-4',
      }),
      requisition({
        id: 'rejected',
        farmerId: 'farmer-e',
        status: 'REJECTED',
        requestedAcres: '100.00',
        fulfilledAcres: '9.00',
        accountNumber: 'A-5',
      }),
    ]);

    expect(analytics.totals.acres).toBeCloseTo(14.5);
    expect(analytics.totals.requisitions).toBe(4);
    expect(analytics.totals.fulfilledAcres).toBeCloseTo(3.5);
    expect(analytics.totals.farmers).toBe(4);
    expect(analytics.totals.familyGroups).toBe(3);
    expect(analytics.families.find((family) => family.key === 'fam-1')?.label).toBe('Sita Devi');
    expect(analytics.families.find((family) => family.key === 'farmer-a')?.label).toBe('Ram Singh');
    expect(analytics.families.map((family) => family.key)).toEqual(
      expect.arrayContaining(['farmer-a', 'farmer-b', 'fam-1']),
    );
  });

  it('marks hot stations until cumulative share reaches 75 percent, capped at 5', () => {
    const uneven = computeRequisitionAnalytics([
      requisition({ id: 'v1', stationId: 's1', stationName: 'One', requestedAcres: '40' }),
      requisition({ id: 'v2', stationId: 's2', stationName: 'Two', requestedAcres: '20' }),
      requisition({ id: 'v3', stationId: 's3', stationName: 'Three', requestedAcres: '16' }),
      requisition({ id: 'v4', stationId: 's4', stationName: 'Four', requestedAcres: '10' }),
      requisition({ id: 'v5', stationId: 's5', stationName: 'Five', requestedAcres: '8' }),
      requisition({ id: 'v6', stationId: 's6', stationName: 'Six', requestedAcres: '6' }),
    ]);

    expect(uneven.stations.map((station) => station.isHot)).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
    ]);
    expect(uneven.stations[2]?.cumulativePct).toBeCloseTo(76);

    const capped = computeRequisitionAnalytics(
      Array.from({ length: 8 }, (_, index) =>
        requisition({
          id: `equal-${index + 1}`,
          farmerId: `farmer-${index + 1}`,
          stationId: `station-${index + 1}`,
          stationName: `Station ${index + 1}`,
          requestedAcres: '10',
        }),
      ),
    );

    expect(capped.stations.filter((station) => station.isHot)).toHaveLength(5);
    expect(capped.stations[4]?.isHot).toBe(true);
    expect(capped.stations[5]?.isHot).toBe(false);
    expect(capped.stations[4]?.cumulativePct).toBeLessThan(75);
  });

  it('re-ranks stations by the selected variety', () => {
    const analytics = computeRequisitionAnalytics([
      requisition({
        id: 'a-b101',
        stationId: 'a',
        stationName: 'Alpha',
        varietyId: 'b101',
        varietyName: 'B101',
        requestedAcres: '10',
      }),
      requisition({
        id: 'a-santana',
        farmerId: 'farmer-a2',
        stationId: 'a',
        stationName: 'Alpha',
        varietyId: 'santana',
        varietyName: 'Santana',
        requestedAcres: '50',
      }),
      requisition({
        id: 'b-b101',
        farmerId: 'farmer-b',
        stationId: 'b',
        stationName: 'Beta',
        varietyId: 'b101',
        varietyName: 'B101',
        requestedAcres: '40',
      }),
    ]);

    const ranked = rankStations(analytics.stations, 'B101');
    expect(ranked.map((station) => station.name)).toEqual(['Beta', 'Alpha']);
    expect(ranked[0]?.isHot).toBe(true);
    expect(ranked[1]?.isHot).toBe(false);
    expect(ranked[0]?.acres).toBeCloseTo(40);
  });

  it('flags a bank account shared by different farmers without exposing the account', () => {
    const analytics = computeRequisitionAnalytics([
      requisition({
        id: 'a',
        farmerId: 'farmer-a',
        accountNumber: 'A-1',
        name: 'Ram Singh',
        bankAccountNumber: '999000111222',
        panNumber: 'SECRET_PAN',
        aadharNumber: 'SECRET_AADHAAR',
        ifscCode: 'SBIN0SECRET',
        remarks: 'SECRET_REMARKS',
      }),
      requisition({
        id: 'b',
        farmerId: 'farmer-b',
        accountNumber: 'A-2',
        name: 'Mohan Lal',
        bankAccountNumber: '999000111222',
        mobileNumber: '9111111111',
      }),
      requisition({
        id: 'c',
        farmerId: 'farmer-c',
        familyId: 'fam-1',
        accountNumber: 'A-3',
        mobileNumber: '9222222222',
      }),
      requisition({
        id: 'd',
        farmerId: 'farmer-d',
        familyId: 'fam-1',
        accountNumber: 'A-4',
        mobileNumber: '9222222222',
      }),
    ]);

    const finding = analytics.dataHealth.find((item) => item.id === 'duplicate-bank-account');
    expect(finding?.count).toBe(2);
    expect(finding?.rows.map((row) => row.secondary).sort()).toEqual(['A-1', 'A-2']);

    const serialized = JSON.stringify(analytics);
    expect(serialized).not.toContain('999000111222');
    expect(serialized).not.toContain('SECRET_PAN');
    expect(serialized).not.toContain('SECRET_AADHAAR');
    expect(serialized).not.toContain('SBIN0SECRET');
    expect(serialized).not.toContain('SECRET_REMARKS');
    expect(analytics.dataHealth.some((item) => item.id === 'shared-mobile')).toBe(false);
  });

  it('filters a station scope, skips single-value levels, and groups villages inside it', () => {
    const rows = [
      requisition({
        id: 'a1',
        stationId: 'khatima',
        stationName: 'Khatima',
        villageId: 'keshowala',
        villageName: 'Keshowala',
        requestedAcres: '30',
      }),
      requisition({
        id: 'a2',
        farmerId: 'farmer-a2',
        stationId: 'khatima',
        stationName: 'Khatima',
        villageId: 'nanakmatta',
        villageName: 'Nanakmatta',
        requestedAcres: '10',
      }),
      requisition({
        id: 'b1',
        farmerId: 'farmer-b',
        stationId: 'sitarganj',
        stationName: 'Sitarganj',
        villageId: 'other',
        villageName: 'Other Village',
        requestedAcres: '50',
      }),
    ];

    const scoped = requisitionsInScope(rows, { station: 'khatima' });
    expect(scoped.map((row) => row.id).sort()).toEqual(['a1', 'a2']);
    expect(nextPlaceLevel(scoped, 'station')).toBe('village');
    expect(nextPlaceLevel(rows, null)).toBe('station');

    const villages = computeRequisitionAnalytics(scoped, { groupBy: 'village' });
    expect(villages.stations.map((place) => place.name)).toEqual(['Keshowala', 'Nanakmatta']);
    expect(villages.stations.every((place) => place.childLevel === null)).toBe(true);

    const stations = computeRequisitionAnalytics(rows);
    expect(stations.stations.find((place) => place.name === 'Khatima')?.childLevel).toBe('village');
    expect(stations.stations.find((place) => place.name === 'Sitarganj')?.childLevel).toBe(null);
  });
});
