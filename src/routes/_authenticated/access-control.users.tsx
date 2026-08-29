import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { usersQueryOptions } from '@/features/access-control/api/use-users';
import { UsersTabContent } from '@/features/access-control/components/users/UsersTabContent';

const usersSearchSchema = z.object({
  create: z
    .union([z.literal(true), z.literal(false), z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export const Route = createFileRoute('/_authenticated/access-control/users')({
  validateSearch: usersSearchSchema,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(usersQueryOptions());
  },
  component: AccessControlUsersPage,
});

function AccessControlUsersPage() {
  const { create } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <UsersTabContent
      createOpen={create}
      onCreateOpenChange={(open) => {
        void navigate({
          search: open ? { create: true } : {},
          replace: true,
        });
      }}
    />
  );
}
