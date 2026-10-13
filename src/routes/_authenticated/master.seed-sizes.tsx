import { createFileRoute } from '@tanstack/react-router';
import { seedSizesQueryOptions } from '@/features/master/api/use-seed-sizes';
import { varietiesQueryOptions } from '@/features/master/api/use-varieties';
import { SeedSizesTabContent } from '@/features/master/components/seed-sizes/SeedSizesTabContent';
import { masterCreateSearchSchema } from '@/features/master/lib/create-search';

export const Route = createFileRoute('/_authenticated/master/seed-sizes')({
  validateSearch: masterCreateSearchSchema,
  loader: async ({ context }) => {
    const varieties = await context.queryClient.ensureQueryData(varietiesQueryOptions());
    const firstVariety = varieties[0];
    if (firstVariety) {
      void context.queryClient.prefetchQuery(seedSizesQueryOptions(firstVariety.id));
    }
  },
  component: MasterSeedSizesPage,
});

function MasterSeedSizesPage() {
  const { create } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <SeedSizesTabContent
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
