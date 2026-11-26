export const farmersKeys = {
  all: ['farmers'] as const,
  list: () => [...farmersKeys.all, 'list'] as const,
  families: () => [...farmersKeys.all, 'families'] as const,
  addressOptions: () => [...farmersKeys.all, 'address-options'] as const,
  confirmation: (farmerId: string) => [...farmersKeys.all, 'confirmation', farmerId] as const,
};
