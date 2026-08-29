import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';

export function PermissionsTabContent() {
  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Permissions</CardTitle>
        <CardDescription className="hidden sm:block">
          Define and assign permissions across the platform. Control what each role can view and
          modify.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent className="text-sm text-muted-foreground">
        Permissions content will appear here.
      </PageCardContent>
    </PageCard>
  );
}
