import { Trash2Icon, UserPlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { columns, users } from './columns';
import { UsersTable } from './users-table';

export function UsersTabContent() {
  return (
    <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
      <CardHeader className="px-4 sm:px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
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
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <UsersTable columns={columns} data={users} />
      </CardContent>
    </Card>
  );
}
