import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UsersTabContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Manage user accounts and roles. Invite new users and control who can
          access the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        User management content will appear here.
      </CardContent>
    </Card>
  );
}
