export const farmersKeys = {
  all: ['farmers'] as const,
  list: () => [...farmersKeys.all, 'list'] as const,
  detail: (id: string) => [...farmersKeys.all, 'detail', id] as const,
  contracts: (id: string) => [...farmersKeys.detail(id), 'contracts'] as const,
  families: () => [...farmersKeys.all, 'families'] as const,
};
