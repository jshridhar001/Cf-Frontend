import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SeedDispatchDetailSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <Skeleton className="h-8 w-40 rounded-lg" />

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
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 min-w-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
