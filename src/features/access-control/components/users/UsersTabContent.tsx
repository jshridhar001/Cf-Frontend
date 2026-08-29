import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { columns, users } from './columns';
import { UsersTable } from './users-table';

export function UsersTabContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Manage user accounts and roles. Invite new users and control who can access the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersTable columns={columns} data={users} />
      </CardContent>
    </Card>
  );
}
