export const seedDispatchKeys = {
  all: ['seed-dispatches'] as const,
  list: () => [...seedDispatchKeys.all, 'list'] as const,
  detail: (id: string) => [...seedDispatchKeys.all, 'detail', id] as const,
  dispatchable: () => [...seedDispatchKeys.all, 'dispatchable'] as const,
};
