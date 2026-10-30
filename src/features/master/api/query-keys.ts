import type { AddressMasterId } from '@/features/master/lib/address-masters';

export const masterKeys = {
  all: ['master'] as const,
  varieties: () => [...masterKeys.all, 'varieties'] as const,
  generations: () => [...masterKeys.all, 'generations'] as const,
  seedSizes: (varietyId?: string) =>
    varietyId
      ? ([...masterKeys.all, 'seed-sizes', varietyId] as const)
      : ([...masterKeys.all, 'seed-sizes'] as const),
  facilities: () => [...masterKeys.all, 'facilities'] as const,
  facilityStock: (facilityId?: string) =>
    facilityId
      ? ([...masterKeys.all, 'facility-stock', facilityId] as const)
      : ([...masterKeys.all, 'facility-stock'] as const),
  facilityStockSummary: () => [...masterKeys.all, 'facility-stock-summary'] as const,
  tuberSizes: () => [...masterKeys.all, 'tuber-sizes'] as const,
  addressMasters: (id: AddressMasterId) => [...masterKeys.all, 'addresses', id] as const,
};
