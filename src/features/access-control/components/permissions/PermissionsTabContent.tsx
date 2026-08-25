import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function PermissionsTabContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
        <CardDescription>
          Define and assign permissions across the platform. Control what each
          role can view and modify.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Permissions content will appear here.
      </CardContent>
    </Card>
  );
}
