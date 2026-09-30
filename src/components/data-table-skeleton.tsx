import { Skeleton } from '@/components/ui/skeleton';

const ROW_KEYS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'] as const;

export function DataTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full rounded-xl sm:max-w-sm" />
      <div className="hidden flex-col gap-2 md:flex">
        <Skeleton className="h-10 w-full rounded-xl" />
        {ROW_KEYS.map((key) => (
          <Skeleton key={key} className="h-12 w-full rounded-xl" />
        ))}
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {ROW_KEYS.slice(0, 4).map((key) => (
          <Skeleton key={key} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
