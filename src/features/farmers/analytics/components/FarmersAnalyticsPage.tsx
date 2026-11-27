import { Eye, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  computeFamilyDispatch,
  type DispatchSort,
  type DispatchSortKey,
  type FamilyDispatchSummary,
  formatDispatchAcres,
  sortDispatchRows,
} from '@/features/farmers/analytics/lib/compute-family-dispatch';
import {
  buildDispatchSummaryExcelPackage,
  exportDispatchSummaryExcel,
} from '@/features/farmers/analytics/utils/export-dispatch-summary-excel';
import { useFarmersReport } from '@/features/farmers/report/api/use-farmers-report';
import {
  ariaSortValue,
  MasterTableSortHeader,
} from '@/features/master/components/master-table-sort-header';
import { getApiErrorMessage } from '@/lib/api-client';
import { openExcelPreviewInNewTab } from '@/lib/excel-preview-tab';
import { preloadExcelJS } from '@/lib/load-exceljs';

const SORT_COLUMNS: { key: DispatchSortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'contractedAcres', label: 'Contracted' },
  { key: 'dispatchedAcres', label: 'Dispatched' },
  { key: 'remainingAcres', label: 'Remaining' },
];

function acresLabel(value: number): string {
  return `${formatDispatchAcres(value)} ac`;
}

export function FarmersAnalyticsPage() {
  const { data, isPending, isError, error } = useFarmersReport({});
  const [sort, setSort] = useState<DispatchSort>({ key: 'name', desc: false });
  const [isExporting, setIsExporting] = useState(false);
  const summary = useMemo(() => (data ? computeFamilyDispatch(data.data) : null), [data]);
  const rows = useMemo(
    () => (summary ? sortDispatchRows(summary.rows, sort) : []),
    [summary, sort],
  );
  const canExport = (summary?.rows.length ?? 0) > 0;

  const handleExportError = (exportError: unknown, fallback: string) => {
    const message = exportError instanceof Error ? exportError.message : fallback;
    toast.error(message, { position: 'top-center' });
  };

  const handlePreviewExcel = () => {
    if (!summary || isExporting) return;
    setIsExporting(true);
    void openExcelPreviewInNewTab(() => buildDispatchSummaryExcelPackage({ rows, summary }))
      .catch((exportError: unknown) => {
        handleExportError(exportError, 'Failed to open Excel preview. Please try again.');
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  const handleDownloadExcel = () => {
    if (!summary || isExporting) return;
    setIsExporting(true);
    void exportDispatchSummaryExcel({ rows, summary })
      .then(() => {
        toast.success('Excel downloaded', { position: 'top-center' });
      })
      .catch((exportError: unknown) => {
        handleExportError(exportError, 'Failed to export Excel. Please try again.');
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  const toggleSort = (key: DispatchSortKey) => {
    setSort((current) =>
      current.key === key ? { key, desc: !current.desc } : { key, desc: false },
    );
  };

  if (!data && isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(error, 'Failed to load the dispatch summary.')}
      </p>
    );
  }

  if (!summary) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Dispatch summary
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            One row per family, or per farmer who is not in a family, in name order. Contracted is
            the requested area from the farmer report. Remaining is what is still to dispatch.
          </p>
        </div>
        {canExport ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={isExporting}
              onMouseEnter={() => {
                void preloadExcelJS();
              }}
              onClick={handlePreviewExcel}
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <Eye data-icon="inline-start" />
              )}
              Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={isExporting}
              onMouseEnter={() => {
                void preloadExcelJS();
              }}
              onClick={handleDownloadExcel}
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <FileSpreadsheet data-icon="inline-start" />
              )}
              Excel
            </Button>
          </div>
        ) : null}
      </div>

      {summary.rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No contracted area to summarize.
        </p>
      ) : (
        <>
          <SummaryCards summary={summary} />
          <DispatchTable rows={rows} summary={summary} sort={sort} onSort={toggleSort} />
        </>
      )}
    </div>
  );
}

function SummaryCards({ summary }: { summary: FamilyDispatchSummary }) {
  const cards = [
    { label: 'Contracted', value: acresLabel(summary.contractedAcres), detail: 'Requested area' },
    { label: 'Dispatched', value: acresLabel(summary.dispatchedAcres), detail: 'Already sent' },
    { label: 'Remaining', value: acresLabel(summary.remainingAcres), detail: 'Still to dispatch' },
    { label: 'Sent', value: `${summary.percent}%`, detail: 'Of contracted area' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <PageCard key={card.label}>
          <PageCardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
          </PageCardHeader>
          <PageCardContent>
            <p className="text-sm text-muted-foreground">{card.detail}</p>
          </PageCardContent>
        </PageCard>
      ))}
    </div>
  );
}

function DispatchTable({
  rows,
  summary,
  sort,
  onSort,
}: {
  rows: ReturnType<typeof sortDispatchRows>;
  summary: FamilyDispatchSummary;
  sort: DispatchSort;
  onSort: (key: DispatchSortKey) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {SORT_COLUMNS.map((column) => {
              const sorted = sort.key === column.key ? (sort.desc ? 'desc' : 'asc') : false;
              return (
                <TableHead
                  key={column.key}
                  className="font-medium text-muted-foreground"
                  aria-sort={ariaSortValue(sorted)}
                >
                  <MasterTableSortHeader
                    canSort
                    sorted={sorted}
                    onToggle={() => {
                      onSort(column.key);
                    }}
                  >
                    {column.label}
                  </MasterTableSortHeader>
                </TableHead>
              );
            })}
            <TableHead className="font-medium text-muted-foreground">Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const sent = `${row.percent}% sent`;
            return (
              <TableRow key={row.key}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="tabular-nums">{acresLabel(row.contractedAcres)}</TableCell>
                <TableCell className="tabular-nums">{acresLabel(row.dispatchedAcres)}</TableCell>
                <TableCell className="tabular-nums">{acresLabel(row.remainingAcres)}</TableCell>
                <TableCell>
                  <div className="flex w-24 items-center gap-2">
                    <Progress value={row.percent} className="h-1.5" aria-label={sent} />
                    <span className="w-9 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {row.percent}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell>Total</TableCell>
            <TableCell className="tabular-nums">{acresLabel(summary.contractedAcres)}</TableCell>
            <TableCell className="tabular-nums">{acresLabel(summary.dispatchedAcres)}</TableCell>
            <TableCell className="tabular-nums">{acresLabel(summary.remainingAcres)}</TableCell>
            <TableCell className="tabular-nums">{summary.percent}%</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
