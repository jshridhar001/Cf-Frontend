import type { AddressMasterId } from '@/features/master/lib/address-masters';

export const masterKeys = {
  all: ['master'] as const,
  varieties: () => [...masterKeys.all, 'varieties'] as const,
  generations: () => [...masterKeys.all, 'generations'] as const,
  seedSizes: () => [...masterKeys.all, 'seed-sizes'] as const,
  facilities: () => [...masterKeys.all, 'facilities'] as const,
  tuberSizes: () => [...masterKeys.all, 'tuber-sizes'] as const,
  addressMasters: (id: AddressMasterId) => [...masterKeys.all, 'addresses', id] as const,
};
