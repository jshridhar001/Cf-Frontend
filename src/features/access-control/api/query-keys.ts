export const accessControlKeys = {
  all: ['access-control'] as const,
  users: () => [...accessControlKeys.all, 'users'] as const,
  sessions: () => [...accessControlKeys.all, 'sessions'] as const,
};
