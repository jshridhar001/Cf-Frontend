import { useQueryClient } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import { useCallback } from 'react';
import { PageListSkeleton } from '@/components/page-list-skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seedRequisitionKeys } from '@/features/seed-requisition/report/api/query-keys';
import { useDeleteAllSeedRequisitions } from '@/features/seed-requisition/report/api/use-delete-all-seed-requisitions';
import { useSeedRequisitions } from '@/features/seed-requisition/report/api/use-seed-requisitions';
import { getApiErrorMessage } from '@/lib/api-client';

import { SeedRequisitionOverview } from './SeedRequisitionOverview';

export function SeedRequisitionTabContent() {
  const queryClient = useQueryClient();
  const { data: requisitions = [], isPending, isError, error } = useSeedRequisitions();
  const { mutateAsync: deleteAllSeedRequisitions } = useDeleteAllSeedRequisitions();

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: seedRequisitionKeys.list() });
  }, [queryClient]);

  const handleDeleteAll = useCallback(async () => {
    await deleteAllSeedRequisitions();
  }, [deleteAllSeedRequisitions]);

  return (
    <Card className="border-border/50 w-full min-w-0 shadow-sm">
      <CardHeader className="border-border/50 border-b pb-5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <ClipboardList className="size-4" aria-hidden />
          </span>
          Seed Requisition
        </CardTitle>
        <CardDescription className="max-md:text-xs">
          Browse requisitions in a table. Approve or reject pending rows from the actions menu.
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 overflow-hidden pt-5">
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
      </CardContent>
    </Card>
  );
}
