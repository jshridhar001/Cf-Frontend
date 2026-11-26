import { createFileRoute, redirect } from '@tanstack/react-router';
import { meQueryOptions } from '@/features/auth/api/use-me';
import { isFieldOfficerRole } from '@/features/auth/lib/authorization';
import { OfficerTimelinePage } from '@/features/task-manager/components/officer-timeline-page';

export const Route = createFileRoute('/_authenticated/task-manager_/officers/$officerId')({
  beforeLoad: async ({ context, params }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions());
    if (isFieldOfficerRole(me?.user.role) && me?.user.id && params.officerId !== me.user.id) {
      throw redirect({
        to: '/task-manager/officers/$officerId',
        params: { officerId: me.user.id },
      });
    }
  },
  component: OfficerTimelineRoute,
});

function OfficerTimelineRoute() {
  const { officerId } = Route.useParams();
  return <OfficerTimelinePage officerId={officerId} />;
}
