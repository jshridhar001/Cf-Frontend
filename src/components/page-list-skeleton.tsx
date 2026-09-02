import { Skeleton } from '@/components/ui/skeleton';

export function PageListSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 sm:gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-11 w-full rounded-lg sm:max-w-xs" />
      <Skeleton className="hidden h-64 w-full rounded-2xl md:block" />
      <div className="flex flex-col gap-2 md:hidden">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}
