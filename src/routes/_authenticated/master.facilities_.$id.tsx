import { createFileRoute } from '@tanstack/react-router';
import { facilitiesQueryOptions } from '@/features/master/api/use-facilities';
import { facilityStockQueryOptions } from '@/features/master/api/use-facility-stock';
import { generationsQueryOptions } from '@/features/master/api/use-generations';
import { seedSizesQueryOptions } from '@/features/master/api/use-seed-sizes';
import { varietiesQueryOptions } from '@/features/master/api/use-varieties';
import { FacilityStockPage } from '@/features/master/components/facilities/FacilityStockPage';

export const Route = createFileRoute('/_authenticated/master/facilities_/$id')({
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(facilityStockQueryOptions(params.id));
    void context.queryClient.prefetchQuery(facilitiesQueryOptions());
    void context.queryClient.prefetchQuery(varietiesQueryOptions());
    void context.queryClient.prefetchQuery(seedSizesQueryOptions());
    void context.queryClient.prefetchQuery(generationsQueryOptions());
  },
  component: FacilityStockRoute,
});

function FacilityStockRoute() {
  const { id } = Route.useParams();
  return <FacilityStockPage facilityId={id} />;
}
