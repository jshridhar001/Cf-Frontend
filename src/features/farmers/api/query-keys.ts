export const farmersKeys = {
  all: ['farmers'] as const,
  list: () => [...farmersKeys.all, 'list'] as const,
  detail: (id: string) => [...farmersKeys.all, 'detail', id] as const,
  families: () => [...farmersKeys.all, 'families'] as const,
};
