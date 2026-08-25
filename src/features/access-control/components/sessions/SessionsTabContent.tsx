import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SessionsTabContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          Review active sessions and revoke access when needed. Monitor where
          users are signed in.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Sessions content will appear here.
      </CardContent>
    </Card>
  );
}
