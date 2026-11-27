import { redirect } from '@tanstack/react-router';
import { homeLocationForRole } from '@/features/auth/lib/authorization';

export function throwRedirectHome(role?: string | null, userId?: string | null): never {
  const home = homeLocationForRole(role, userId);
  if (home.to === '/task-manager/officers/$officerId') {
    throw redirect({ to: home.to, params: home.params });
  }

  throw redirect({ to: home.to });
}
