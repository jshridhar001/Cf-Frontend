import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TransferStockDetailSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <Skeleton className="h-8 w-40 rounded-lg" />
      <PageCard className="border-border/50 min-w-0 shadow-sm">
        <PageCardHeader>
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="mt-1 h-4 w-64" />
          </CardDescription>
        </PageCardHeader>
        <PageCardContent>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {['from', 'to', 'date', 'truck', 'destination', 'bags'].map((field) => (
              <div key={field} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </PageCardContent>
      </PageCard>
    </div>
  );
}
