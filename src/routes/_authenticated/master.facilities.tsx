import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { facilitiesQueryOptions } from '@/features/master/api/use-facilities';
import { facilityStockSummaryQueryOptions } from '@/features/master/api/use-facility-stock-summary';
import { FacilitiesTabContent } from '@/features/master/components/facilities/FacilitiesTabContent';
import { TotalStockTabContent } from '@/features/master/components/facilities/TotalStockTabContent';
import { masterFacilitiesSearchSchema } from '@/features/master/lib/create-search';

export const Route = createFileRoute('/_authenticated/master/facilities')({
  validateSearch: masterFacilitiesSearchSchema,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(facilitiesQueryOptions());
    void context.queryClient.prefetchQuery(facilityStockSummaryQueryOptions());
  },
  component: MasterFacilitiesPage,
});

function MasterFacilitiesPage() {
  const { create, tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeTab = create || tab === 'facility' ? 'facility' : 'total';

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        void navigate({
          search: { tab: value === 'facility' ? 'facility' : 'total' },
          replace: true,
        });
      }}
      className="w-full"
    >
      <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
        <TabsTrigger value="total" className="shrink-0">
          Total Stock
        </TabsTrigger>
        <TabsTrigger value="facility" className="shrink-0">
          Facility Wise Stock
        </TabsTrigger>
      </TabsList>
      <TabsContent value="total">
        <TotalStockTabContent />
      </TabsContent>
      <TabsContent value="facility">
        <FacilitiesTabContent
          createOpen={create}
          onCreateOpenChange={(open) => {
            void navigate({
              search: {
                tab: 'facility',
                ...(open ? { create: true as const } : {}),
              },
              replace: true,
            });
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
