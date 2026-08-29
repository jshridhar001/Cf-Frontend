import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';

export function SessionsTabContent() {
  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription className="hidden sm:block">
          Review active sessions and revoke access when needed. Monitor where users are signed in.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent className="text-sm text-muted-foreground">
        Sessions content will appear here.
      </PageCardContent>
    </PageCard>
  );
}
