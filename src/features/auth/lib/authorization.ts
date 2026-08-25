import type { Role } from '../types';

export const ADMIN_ALLOWED_ROLES = [
  'MANAGING_DIRECTOR',
  'SUPER_DEVELOPER',
  'PROGRAMME_MANAGER',
] as const satisfies readonly Role[];

export type AdminAllowedRole = (typeof ADMIN_ALLOWED_ROLES)[number];

export function canAccessAdminRoutes(role?: string | null): boolean {
  if (!role) return false;
  return (ADMIN_ALLOWED_ROLES as readonly string[]).includes(role);
}
