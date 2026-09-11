import { useQueryClient } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import { useCallback } from 'react';

import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { PageListSkeleton } from '@/components/page-list-skeleton';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { seedRequisitionReportKeys } from '@/features/seed-requisition/report/api/query-keys';
import { useDeleteAllSeedRequisitions } from '@/features/seed-requisition/report/api/use-delete-all-seed-requisitions';
import { useSeedRequisitionReport } from '@/features/seed-requisition/report/api/use-seed-requisition-report';
import { SeedRequisitionOverview } from '@/features/seed-requisition/report/components/SeedRequisitionOverview';
import { getApiErrorMessage } from '@/lib/api-client';

export default function SeedRequisitionReportPage() {
  const queryClient = useQueryClient();
  const { data: requisitions = [], isPending, isError, error } = useSeedRequisitionReport();
  const { mutateAsync: deleteAllSeedRequisitions } = useDeleteAllSeedRequisitions();

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: seedRequisitionReportKeys.list() });
  }, [queryClient]);

  const handleDeleteAll = useCallback(async () => {
    await deleteAllSeedRequisitions();
  }, [deleteAllSeedRequisitions]);

  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <ClipboardList className="size-4" aria-hidden />
          </span>
          Report
        </CardTitle>
        <CardDescription className="hidden sm:block">
          Filter, group, and review requisitions. Approve or reject pending rows from the actions
          menu.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent className="min-w-0 overflow-hidden">
        {isPending ? (
          <PageListSkeleton />
        ) : isError ? (
          <p className="text-destructive py-8 text-center text-sm">
            {getApiErrorMessage(error, 'Failed to load seed requisitions.')}
          </p>
        ) : (
          <SeedRequisitionOverview
            data={requisitions}
            onRefresh={handleRefresh}
            onDeleteAll={handleDeleteAll}
          />
        )}
      </PageCardContent>
    </PageCard>
  );
}
