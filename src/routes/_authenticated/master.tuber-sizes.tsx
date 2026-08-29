import { createFileRoute } from '@tanstack/react-router';
import { tuberSizesQueryOptions } from '@/features/master/api/use-tuber-sizes';
import { TuberSizesTabContent } from '@/features/master/components/tuber-sizes/TuberSizesTabContent';
import { masterCreateSearchSchema } from '@/features/master/lib/create-search';

export const Route = createFileRoute('/_authenticated/master/tuber-sizes')({
  validateSearch: masterCreateSearchSchema,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(tuberSizesQueryOptions());
  },
  component: MasterTuberSizesPage,
});

function MasterTuberSizesPage() {
  const { create } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <TuberSizesTabContent
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
