import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { TransferCreateForm } from '@/features/transfer-stock/create/components/transfer-create-form';
import { getApiErrorMessage } from '@/lib/api-client';

export function CreateTransferStockPage() {
  const { data: farmers = [], isPending, isError, error } = useFarmers();
  const activeFarmers = farmers.filter((farmer) => farmer.status === 'ACTIVE');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
          <Link to="/transfer-stock">
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        </Button>
      </div>

      <PageCard className="border-border/50 w-full min-w-0 shadow-sm">
        <PageCardHeader className="border-border/50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <ArrowLeftRight className="size-4" aria-hidden />
            </span>
            Create transfer
          </CardTitle>
          <CardDescription className="hidden sm:block">
            Choose a source farmer, enter bag quantities from their stock, pick who receives them,
            then enter truck details.
          </CardDescription>
        </PageCardHeader>
        <PageCardContent className="min-w-0">
          {isPending ? <DataTableSkeleton /> : null}
          {isError ? (
            <p className="text-destructive py-8 text-center text-sm">
              {getApiErrorMessage(error, 'Failed to load farmers.')}
            </p>
          ) : null}
          {!isPending && !isError && activeFarmers.length < 2 ? (
            <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
              At least two active farmers are required to transfer stock.
            </p>
          ) : null}
          {!isPending && !isError && activeFarmers.length >= 2 ? (
            <TransferCreateForm farmers={farmers} />
          ) : null}
        </PageCardContent>
      </PageCard>
    </div>
  );
}
