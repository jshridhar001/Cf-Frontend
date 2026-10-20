export const farmerSeedAndFieldsKeys = {
  all: ['farmer-profile', 'seed-and-fields'] as const,
};

export const farmerFieldKeys = {
  all: ['farmer-fields'] as const,
  list: () => [...farmerFieldKeys.all, 'list'] as const,
  detail: (id: string) => [...farmerFieldKeys.all, 'detail', id] as const,
};

export const plantationKeys = {
  all: ['plantations'] as const,
  list: (fieldId: string) => [...plantationKeys.all, 'list', fieldId] as const,
};
