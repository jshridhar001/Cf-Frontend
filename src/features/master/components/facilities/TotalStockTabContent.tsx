import { useMemo } from 'react';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { useFacilityStockSummary } from '@/features/master/api/use-facility-stock-summary';
import { buildFacilityStockMatrix } from '@/features/master/lib/facility-stock-summary';
import { getApiErrorMessage } from '@/lib/api-client';
import { TotalStockTable } from './total-stock-table';

export function TotalStockTabContent() {
  const { data: summary, isPending, isError, error } = useFacilityStockSummary();
  const matrix = useMemo(() => buildFacilityStockMatrix(summary ?? []), [summary]);

  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Total Stock</CardTitle>
        <CardDescription>
          The table shows the current quantity for each variety and size. Click a cell to view its
          initial quantity.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent>
        {isPending && summary === undefined ? <DataTableSkeleton /> : null}

        {isError && summary === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {summary !== undefined ? <TotalStockTable matrix={matrix} /> : null}
      </PageCardContent>
    </PageCard>
  );
}
