import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardTitle } from '@/components/ui/card';
import { FarmersListView } from '@/features/farmers/overview/components/farmers-list-view';

export function FarmersTabContent() {
  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Farmers</CardTitle>
      </PageCardHeader>
      <PageCardContent>
        <FarmersListView showLayoutToggle />
      </PageCardContent>
    </PageCard>
  );
}
