export const seedDispatchKeys = {
  all: ['seed-dispatch'] as const,
  lists: () => [...seedDispatchKeys.all, 'list'] as const,
  list: () => seedDispatchKeys.lists(),
  details: () => [...seedDispatchKeys.all, 'detail'] as const,
  detail: (id: string) => [...seedDispatchKeys.details(), id] as const,
  dispatchable: () => [...seedDispatchKeys.all, 'dispatchable'] as const,
};
