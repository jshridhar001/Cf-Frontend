import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SeedDispatchDetailSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <Skeleton className="h-8 w-40 rounded-lg" />

      <PageCard className="min-w-0 border-border/50 shadow-sm">
        <PageCardHeader className="pb-4">
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="mt-1 h-4 w-64" />
          </CardDescription>
        </PageCardHeader>
        <PageCardContent>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'date',
              'delivered',
              'truck',
              'gate',
              'slip',
              'driver',
              'destination',
              'gross',
              'net',
            ].map((field) => (
              <div key={field} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </PageCardContent>
      </PageCard>

      <PageCard className="min-w-0 border-border/50 shadow-sm">
        <PageCardHeader className="pb-4">
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-20" />
          </CardTitle>
        </PageCardHeader>
        <PageCardContent className="space-y-3">
          {['lot-a', 'lot-b', 'lot-c', 'lot-d'].map((lot) => (
            <Skeleton key={lot} className="h-12 w-full rounded-md" />
          ))}
        </PageCardContent>
      </PageCard>
    </div>
  );
}
