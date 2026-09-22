import type { AddressLevel } from '@/features/master/lib/address-levels';

export const masterKeys = {
  all: ['master'] as const,
  varieties: () => [...masterKeys.all, 'varieties'] as const,
  generations: () => [...masterKeys.all, 'generations'] as const,
  seedSizes: () => [...masterKeys.all, 'seed-sizes'] as const,
  facilities: () => [...masterKeys.all, 'facilities'] as const,
  tuberSizes: () => [...masterKeys.all, 'tuber-sizes'] as const,
  addresses: (level?: AddressLevel, parentId?: string) =>
    parentId && level
      ? ([...masterKeys.all, 'addresses', level, parentId] as const)
      : level
        ? ([...masterKeys.all, 'addresses', level] as const)
        : ([...masterKeys.all, 'addresses'] as const),
};
