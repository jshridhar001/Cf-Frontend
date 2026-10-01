import { isAxiosError } from 'axios';
import { SeedDispatchDetailSkeleton } from '@/features/seed-dispatch/detail/components/seed-dispatch-detail-skeleton';
import { SeedDispatchDetailView } from '@/features/seed-dispatch/detail/components/seed-dispatch-detail-view';
import { useSeedDispatch } from '@/features/seed-dispatch/overview/api/use-seed-dispatch';
import { getApiErrorMessage } from '@/lib/api-client';

type SeedDispatchDetailPageProps = {
  id: string;
};

export function SeedDispatchDetailPage({ id }: SeedDispatchDetailPageProps) {
  const { data, isPending, isError, error } = useSeedDispatch(id);

  if (isPending) {
    return <SeedDispatchDetailSkeleton />;
  }

  if (isError || !data) {
    const notFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {notFound
          ? 'Dispatch not found.'
          : getApiErrorMessage(error, 'Failed to load seed dispatch.')}
      </div>
    );
  }

  return <SeedDispatchDetailView dispatch={data} />;
}
