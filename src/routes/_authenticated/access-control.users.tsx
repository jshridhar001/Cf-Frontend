import { createFileRoute } from '@tanstack/react-router';
import { usersQueryOptions } from '@/features/access-control/api/use-users';
import { UsersTabContent } from '@/features/access-control/components/users/UsersTabContent';

export const Route = createFileRoute('/_authenticated/access-control/users')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(usersQueryOptions());
  },
  component: AccessControlUsersPage,
});

function AccessControlUsersPage() {
  return <UsersTabContent />;
}
