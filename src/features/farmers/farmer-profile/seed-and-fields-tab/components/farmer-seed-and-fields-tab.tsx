import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardTitle } from '@/components/ui/card';

export function FarmerSeedAndFieldsTab() {
  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Seed & fields</CardTitle>
      </PageCardHeader>
      <PageCardContent>
        <p className="leading-7">Seed and field details will appear here.</p>
      </PageCardContent>
    </PageCard>
  );
}
