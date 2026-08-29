import { createFileRoute } from '@tanstack/react-router';
import { stationsQueryOptions } from '@/features/master/api/use-stations';
import { StationsTabContent } from '@/features/master/components/stations/StationsTabContent';
import { masterCreateSearchSchema } from '@/features/master/lib/create-search';

export const Route = createFileRoute('/_authenticated/master/stations')({
  validateSearch: masterCreateSearchSchema,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(stationsQueryOptions());
  },
  component: MasterStationsPage,
});

function MasterStationsPage() {
  const { create } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <StationsTabContent
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
