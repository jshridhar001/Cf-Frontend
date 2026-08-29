import { createFileRoute } from '@tanstack/react-router';
import { facilitiesQueryOptions } from '@/features/master/api/use-facilities';
import { FacilitiesTabContent } from '@/features/master/components/facilities/FacilitiesTabContent';
import { masterCreateSearchSchema } from '@/features/master/lib/create-search';

export const Route = createFileRoute('/_authenticated/master/facilities')({
  validateSearch: masterCreateSearchSchema,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(facilitiesQueryOptions());
  },
  component: MasterFacilitiesPage,
});

function MasterFacilitiesPage() {
  const { create } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <FacilitiesTabContent
      createOpen={create}
      onCreateOpenChange={(open) => {
        void navigate({
          search: open ? { create: true } : {},
          replace: true,
        });
      }}
    />
  );
}
