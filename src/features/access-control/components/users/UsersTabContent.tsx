import { Trash2Icon, UserPlusIcon } from 'lucide-react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { columns, users } from './columns';
import { UsersTable } from './users-table';

export function UsersTabContent() {
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
        <UsersTable columns={columns} data={users} />
      </PageCardContent>
    </PageCard>
  );
}
