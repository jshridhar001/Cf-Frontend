import { createFileRoute } from '@tanstack/react-router';
import { SessionsTabContent } from '@/features/access-control/components/sessions/SessionsTabContent';

export const Route = createFileRoute('/_authenticated/access-control/sessions')({
  component: AccessControlSessionsPage,
});

function AccessControlSessionsPage() {
  return <SessionsTabContent />;
}
