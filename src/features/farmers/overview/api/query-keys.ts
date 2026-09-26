export const farmersKeys = {
  all: ['farmers'] as const,
  list: () => [...farmersKeys.all, 'list'] as const,
  addressOptions: () => [...farmersKeys.all, 'address-options'] as const,
};
