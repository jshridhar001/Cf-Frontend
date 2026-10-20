import { useMemo } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmerFields } from '@/features/farmers/farmer-profile/seed-and-fields-tab/api/use-farmer-fields';
import { FarmerStockSummaryTable } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/farmer-stock-summary-table';
import { FieldsPlantedCard } from '@/features/farmers/farmer-profile/seed-and-fields-tab/components/fields-planted-card';
import { pivotFarmerStock } from '@/features/farmers/farmer-profile/seed-and-fields-tab/lib/pivot-farmer-stock';
import type { Farmer } from '@/features/farmers/overview/types';
import { useFarmerStock } from '@/features/transfer-stock/create/api/use-farmer-stock';
import { getApiErrorMessage } from '@/lib/api-client';

export function FarmerSeedAndFieldsTab({ farmer }: { farmer: Farmer }) {
  const stockQuery = useFarmerStock(farmer.id);
  const summary = useMemo(() => pivotFarmerStock(stockQuery.data ?? []), [stockQuery.data]);
  const stockErrorMessage = stockQuery.isError
    ? getApiErrorMessage(stockQuery.error, 'Failed to load farmer stock.')
    : null;
  const fieldsQuery = useFarmerFields(farmer.id);
  const fieldsErrorMessage = fieldsQuery.isError
    ? getApiErrorMessage(fieldsQuery.error, 'Failed to load fields.')
    : null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <PageCard>
        <PageCardHeader>
          <CardTitle>Seed & fields</CardTitle>
          <CardDescription className="hidden sm:block">
            Bags on hand by variety and size.
          </CardDescription>
        </PageCardHeader>
        <PageCardContent>
          {stockQuery.isPending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : stockErrorMessage ? (
            <p className="text-destructive rounded-xl border border-dashed px-4 py-10 text-center text-sm">
              {stockErrorMessage}
            </p>
          ) : summary.rows.length === 0 ? (
            <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
              This farmer has no stock on hand.
            </p>
          ) : (
            <FarmerStockSummaryTable summary={summary} />
          )}
        </PageCardContent>
      </PageCard>
      <FieldsPlantedCard
        farmerId={farmer.id}
        fields={fieldsQuery.data ?? []}
        isPending={fieldsQuery.isPending}
        errorMessage={fieldsErrorMessage}
      />
    </div>
  );
}
