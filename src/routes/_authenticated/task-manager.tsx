import { createFileRoute, redirect } from '@tanstack/react-router';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { isFieldOfficerRole } from '@/features/auth/lib/authorization';
import { TaskManagerPage } from '@/features/task-manager/components/task-manager-page';

export const Route = createFileRoute('/_authenticated/task-manager')({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());
    if (isFieldOfficerRole(me?.user.role) && me?.user.id) {
      throw redirect({
        to: '/task-manager/officers/$officerId',
        params: { officerId: me.user.id },
      });
    }
  },
  component: TaskManagerPage,
});
