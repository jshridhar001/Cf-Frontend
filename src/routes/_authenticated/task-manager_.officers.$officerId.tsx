import { createFileRoute } from '@tanstack/react-router';
import { OfficerTimelinePage } from '@/features/task-manager/components/officer-timeline-page';

export const Route = createFileRoute('/_authenticated/task-manager_/officers/$officerId')({
  component: OfficerTimelineRoute,
});

function OfficerTimelineRoute() {
  const { officerId } = Route.useParams();
  return <OfficerTimelinePage officerId={officerId} />;
}
