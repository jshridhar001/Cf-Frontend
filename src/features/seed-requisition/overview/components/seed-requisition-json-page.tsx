import { useSeedRequisition } from '@/features/seed-requisition/overview/api/use-seed-requisition';
import { getApiErrorMessage } from '@/lib/api-client';

export function SeedRequisitionJsonPage({ id, title }: { id: string; title: string }) {
  const { data, isPending, isError, error } = useSeedRequisition(id);
  const json = data ? JSON.stringify(data, null, 2) : null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
      {json ? (
        <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">{json}</pre>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Loading requisition…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, 'Failed to load requisition.')}
        </p>
      ) : null}
    </div>
  );
}
