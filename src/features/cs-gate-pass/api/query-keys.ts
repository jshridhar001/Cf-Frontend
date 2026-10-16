export const csGatePassKeys = {
  all: ['cs-gate-pass'] as const,
  list: () => [...csGatePassKeys.all, 'list'] as const,
};
