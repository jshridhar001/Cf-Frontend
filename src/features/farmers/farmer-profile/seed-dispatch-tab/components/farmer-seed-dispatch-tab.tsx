import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardTitle } from '@/components/ui/card';

export function FarmerSeedDispatchTab() {
  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Seed Dispatches</CardTitle>
      </PageCardHeader>
      <PageCardContent>
        <p className="leading-7">Seed dispatch details will appear here.</p>
      </PageCardContent>
    </PageCard>
  );
}
