import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { canAccessDashboard } from '@/features/auth/lib/authorization';
import { throwRedirectHome } from '@/features/auth/lib/home-redirect';
import { DashboardPage } from '@/features/dashboard/components/dashboard-page';

const dashboardSearchSchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const Route = createFileRoute('/_authenticated/dashboard')({
  validateSearch: dashboardSearchSchema,
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());
    if (!canAccessDashboard(me?.user.role)) {
      throwRedirectHome(me?.user.role, me?.user.id);
    }
  },
  component: DashboardPage,
});
