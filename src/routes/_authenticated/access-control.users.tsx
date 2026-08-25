import { createFileRoute } from '@tanstack/react-router';
import { UsersTabContent } from '@/features/access-control/components/users/UsersTabContent';

export const Route = createFileRoute('/_authenticated/access-control/users')({
  component: AccessControlUsersPage,
});

function AccessControlUsersPage() {
  return <UsersTabContent />;
}
