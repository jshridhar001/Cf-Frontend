import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SeedRequisitionDetailSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <Skeleton className="h-8 w-40 rounded-lg" />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(240px,320px)_1fr] lg:gap-6">
        <Card className="border-border/50 h-fit shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              <Skeleton className="h-5 w-24" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="mt-1 h-4 w-44" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 min-w-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              <Skeleton className="h-5 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="mt-1 h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {[
                'farmer',
                'variety',
                'acres',
                'bags',
                'status',
                'requisition-date',
                'requested-delivery',
                'approved-delivery',
                'remarks',
                'created',
              ].map((field) => (
                <div key={field} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
