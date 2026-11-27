const HEAD_OFFICE_ROLES = ['SUPER_DEVELOPER', 'MANAGING_DIRECTOR', 'PROGRAMME_MANAGER'] as const;

const DASHBOARD_ROLES = ['SUPER_DEVELOPER', 'MANAGING_DIRECTOR', 'PROGRAMME_MANAGER'] as const;

export function canAccessAdminRoutes(role?: string | null): boolean {
  if (!role) return false;
  return (HEAD_OFFICE_ROLES as readonly string[]).includes(role);
}

export function canAccessDashboard(role?: string | null): boolean {
  if (!role) return false;
  return (DASHBOARD_ROLES as readonly string[]).includes(role);
}

export function isFieldOfficerRole(role?: string | null): boolean {
  return role === 'FIELD_OFFICER';
}

export function homeLocationForRole(role?: string | null, userId?: string | null) {
  if (canAccessDashboard(role)) {
    return { to: '/dashboard' as const };
  }

  if (isFieldOfficerRole(role) && userId) {
    return {
      to: '/task-manager/officers/$officerId' as const,
      params: { officerId: userId },
    };
  }

  return { to: '/task-manager' as const };
}
