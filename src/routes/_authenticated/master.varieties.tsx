import { createFileRoute } from '@tanstack/react-router';
import { varietiesQueryOptions } from '@/features/master/api/use-varieties';
import { VarietiesTabContent } from '@/features/master/components/varieties/VarietiesTabContent';
import { masterCreateSearchSchema } from '@/features/master/lib/create-search';

export const Route = createFileRoute('/_authenticated/master/varieties')({
  validateSearch: masterCreateSearchSchema,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(varietiesQueryOptions());
  },
  component: MasterVarietiesPage,
});

function MasterVarietiesPage() {
  const { create } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <VarietiesTabContent
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
