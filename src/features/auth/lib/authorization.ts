const HEAD_OFFICE_ROLES = [
  'SUPER_DEVELOPER',
  'MANAGING_DIRECTOR',
  'PROGRAMME_MANAGER',
] as const;

export function canAccessAdminRoutes(role?: string | null): boolean {
  if (!role) return false;
  return (HEAD_OFFICE_ROLES as readonly string[]).includes(role);
}
