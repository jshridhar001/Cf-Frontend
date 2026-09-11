import { isAxiosError } from 'axios';

import { useSeedRequisition } from '@/features/seed-requisition/report/api/use-seed-requisition';
import { getApiErrorMessage } from '@/lib/api-client';

import { SeedRequisitionDetailSkeleton } from './seed-requisition-detail-skeleton';
import { SeedRequisitionDetailView } from './seed-requisition-detail-view';

type SeedRequisitionDetailProps = {
  id: string;
};

export function SeedRequisitionDetail({ id }: SeedRequisitionDetailProps) {
  const { data, isPending, isError, error } = useSeedRequisition(id);

  if (isPending) {
    return <SeedRequisitionDetailSkeleton />;
  }

  if (isError || !data) {
    const notFound = isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
        {notFound
          ? 'Requisition not found.'
          : getApiErrorMessage(error, 'Failed to load seed requisition.')}
      </div>
    );
  }

  return <SeedRequisitionDetailView requisition={data} />;
}
