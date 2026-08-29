import { Trash2Icon, UserPlusIcon } from 'lucide-react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useUsers } from '@/features/access-control/api/use-users';
import { getApiErrorMessage } from '@/lib/api-client';
import { columns } from './columns';
import { UsersTable } from './users-table';

export function UsersTabContent() {
  const { data: users, isPending, isError, error } = useUsers();

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Users</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage user accounts and roles. Invite new users and control who can access the platform.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Delete all users"
          >
            <Trash2Icon />
          </Button>
          <Button type="button" size="icon" className="min-h-11 min-w-11" aria-label="Add user">
            <UserPlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && users === undefined ? (
          <p className="text-sm text-muted-foreground">Loading users…</p>
        ) : null}

        {isError && users === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {users !== undefined ? <UsersTable columns={columns} data={users} /> : null}
      </PageCardContent>
    </PageCard>
  );
}
