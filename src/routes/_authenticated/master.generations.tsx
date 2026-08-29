import { createFileRoute } from '@tanstack/react-router';
import { generationsQueryOptions } from '@/features/master/api/use-generations';
import { GenerationsTabContent } from '@/features/master/components/generations/GenerationsTabContent';
import { masterCreateSearchSchema } from '@/features/master/lib/create-search';

export const Route = createFileRoute('/_authenticated/master/generations')({
  validateSearch: masterCreateSearchSchema,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(generationsQueryOptions());
  },
  component: MasterGenerationsPage,
});

function MasterGenerationsPage() {
  const { create } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <GenerationsTabContent
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
