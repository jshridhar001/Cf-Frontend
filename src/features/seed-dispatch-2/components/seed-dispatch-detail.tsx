import { isAxiosError } from 'axios';

import { useSeedDispatch } from '@/features/seed-dispatch/api/use-seed-dispatch';
import { getApiErrorMessage } from '@/lib/api-client';

import { SeedDispatchDetailSkeleton } from './seed-dispatch-detail-skeleton';
import { SeedDispatchDetailView } from './seed-dispatch-detail-view';

type SeedDispatchDetailProps = {
  id: string;
};

export function SeedDispatchDetail({ id }: SeedDispatchDetailProps) {
  const { data, isPending, isError, error } = useSeedDispatch(id);

  if (isPending) {
    return <SeedDispatchDetailSkeleton />;
  }

  if (isError || !data) {
    const notFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
        {notFound
          ? 'Dispatch not found.'
          : getApiErrorMessage(error, 'Failed to load seed dispatch.')}
      </div>
    );
  }

  return <SeedDispatchDetailView dispatch={data} />;
}
