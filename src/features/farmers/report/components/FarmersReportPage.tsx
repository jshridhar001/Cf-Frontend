import { Skeleton } from '@/components/ui/skeleton';
import { useFarmersReport } from '@/features/farmers/report/api/use-farmers-report';
import {
  ContractTableView,
  useReportTable,
} from '@/features/farmers/report/components/contract-table';
import { ReportViewFiltersSheet } from '@/features/farmers/report/components/view-filters/ReportViewFiltersSheet';
import { formatMeasure, summarizeContract } from '@/features/farmers/report/lib/display';
import { getApiErrorMessage } from '@/lib/api-client';

export function FarmersReportPage() {
  const { data, isPending, isError, error } = useFarmersReport({});
  const rows = data?.data ?? [];
  const table = useReportTable(rows);
  const filtered = table.getFilteredRowModel().rows.map((row) => row.original);
  const summary = summarizeContract(filtered);
  const ready = !isPending && !isError;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Seed requisitions
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Shows what was asked for, what was sent, and what is left. Acres here also count bag
            requests turned into acres, so the total is higher than the Seed-Requisition Overview,
            which counts only acres entered as acres. The Seed-Requisition Overview status cards
            are planned deliveries, not seed already sent.
          </p>
        </div>
        {ready ? <ReportViewFiltersSheet table={table} /> : null}
      </div>

      {isPending ? <Skeleton className="h-16 w-full rounded-xl" /> : null}
      {ready ? <ReportSummary summary={summary} /> : null}

      {isPending ? <Skeleton className="h-64 w-full rounded-xl" /> : null}
      {isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, 'Failed to load seed requisitions.')}
        </p>
      ) : null}
      {ready && filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {rows.length === 0 ? 'No requisitions.' : 'No requisitions match these filters.'}
        </p>
      ) : null}
      {ready && filtered.length > 0 ? <ContractTableView table={table} /> : null}
    </div>
  );
}

function ReportSummary({ summary }: { summary: ReturnType<typeof summarizeContract> }) {
  const items = [
    { label: 'requisitions', value: String(summary.requisitions) },
    { label: 'pending', value: String(summary.pending) },
    { label: 'acres requested', value: formatMeasure(summary.acresRequested) },
    { label: 'acres dispatched', value: formatMeasure(summary.acresDispatched) },
    { label: 'bags dispatched', value: formatMeasure(summary.bagsDispatched) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dd className="text-2xl font-semibold tracking-tight tabular-nums">{item.value}</dd>
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}
