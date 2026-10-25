export const fieldTaskKeys = {
  all: ['field-tasks'] as const,
  list: () => [...fieldTaskKeys.all, 'list'] as const,
  officer: (officerId: string) => [...fieldTaskKeys.all, 'officer', officerId] as const,
};
