import { Link } from '@tanstack/react-router';
import { ChevronDownIcon, Eye, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { useFieldTasks } from '@/features/task-manager/api/use-field-tasks';
import { type TasksTable, useTasksTable } from '@/features/task-manager/components/use-tasks-table';
import { TaskViewFiltersSheet } from '@/features/task-manager/components/view-filters/ViewFiltersSheet';
import type { TaskListItem } from '@/features/task-manager/lib/task-view';
import { toTaskListItem } from '@/features/task-manager/lib/task-view';
import type { FieldTask } from '@/features/task-manager/types';
import {
  buildTaskManagerExcelPackage,
  exportTaskManagerExcel,
} from '@/features/task-manager/utils/export-task-manager-excel';
import { getApiErrorMessage } from '@/lib/api-client';
import { openExcelPreviewInNewTab } from '@/lib/excel-preview-tab';
import { preloadExcelJS } from '@/lib/load-exceljs';
import { cn } from '@/lib/utils';

type TaskRow = ReturnType<TasksTable['getRowModel']>['rows'][number];

function leafCount(row: TaskRow): number {
  if (!row.getIsGrouped()) return 1;
  return row.subRows.reduce((sum, child) => sum + leafCount(child), 0);
}

function taskCountLabel(count: number) {
  return `${count.toLocaleString('en-IN')} ${count === 1 ? 'task' : 'tasks'}`;
}

function groupLabel(row: TaskRow) {
  const groupedCell = row.getVisibleCells().find((cell) => cell.getIsGrouped());
  const value = groupedCell?.getValue();
  return value == null || value === '' ? 'Blank' : String(value);
}

function TaskTableView({ table }: { table: TasksTable }) {
  const rows = table.getRowModel().rows;
  const columnCount = Math.max(1, table.getVisibleLeafColumns().length);

  return (
    <div className="hidden overflow-hidden rounded-lg border md:block">
      <Table aria-label="Field tasks">
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold">
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(
                row.getIsGrouped() &&
                  'bg-muted/70 shadow-[inset_3px_0_0_0] shadow-primary/35 hover:bg-muted/80',
              )}
            >
              {row.getVisibleCells().map((cell) => {
                if (cell.getIsPlaceholder()) return <TableCell key={cell.id} />;

                if (cell.getIsGrouped()) {
                  return (
                    <TableCell key={cell.id}>
                      <div
                        className="flex min-w-0 items-center gap-2"
                        style={{ paddingInlineStart: row.depth * 16 }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="size-7"
                          aria-label={row.getIsExpanded() ? 'Collapse group' : 'Expand group'}
                          onClick={row.getToggleExpandedHandler()}
                        >
                          <ChevronDownIcon
                            className={cn(
                              'size-4 transition-transform',
                              row.getIsExpanded() ? 'rotate-0' : '-rotate-90',
                            )}
                          />
                        </Button>
                        <span className="min-w-0 truncate font-medium">
                          {groupLabel(row)}
                          <span className="ml-2 font-normal text-muted-foreground">
                            {taskCountLabel(leafCount(row))}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                  );
                }

                if (row.getIsGrouped()) return <TableCell key={cell.id} />;

                return (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                );
              })}
              {row.getVisibleCells().length === 0 ? <TableCell colSpan={columnCount} /> : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const MOBILE_DETAIL_COLUMNS = new Set(['field', 'farmer', 'officer', 'dueDate']);

function MobileDetail({ columnId, item }: { columnId: string; item: TaskListItem }) {
  if (columnId === 'field') {
    return (
      <Link
        to="/farmers/$id/fields/$fieldId"
        params={{ id: item.task.field.farmerId, fieldId: item.task.fieldId }}
        className="font-medium text-primary hover:underline"
      >
        {item.fieldName}
      </Link>
    );
  }
  if (columnId === 'farmer') {
    return (
      <Link
        to="/farmers/$id"
        params={{ id: item.task.field.farmerId }}
        className="font-medium text-primary uppercase hover:underline"
      >
        {item.farmerName}
      </Link>
    );
  }
  if (columnId === 'officer') {
    return (
      <Link
        to="/task-manager/officers/$officerId"
        params={{ officerId: item.task.assignedOfficerId }}
        className="font-medium text-primary hover:underline"
      >
        {item.officerName}
      </Link>
    );
  }
  return <time dateTime={item.task.dueDate}>{item.dueLabel}</time>;
}

const MOBILE_LABELS: Record<string, string> = {
  field: 'Field',
  farmer: 'Farmer',
  officer: 'Officer',
  dueDate: 'Due',
};

function TaskItemList({ table }: { table: TasksTable }) {
  const rows = table.getRowModel().rows;
  const visibleIds = table.getVisibleLeafColumns().map((column) => column.id);
  const showTask = visibleIds.includes('task');
  const showStatus = visibleIds.includes('status');
  const detailIds = visibleIds.filter((id) => MOBILE_DETAIL_COLUMNS.has(id));

  return (
    <div className="flex flex-col gap-2 md:hidden">
      {rows.map((row) => {
        if (row.getIsGrouped()) {
          return (
            <button
              key={row.id}
              type="button"
              className="flex min-h-11 items-center gap-2 rounded-lg bg-muted/70 px-3 text-left"
              style={{ marginInlineStart: row.depth * 12 }}
              onClick={row.getToggleExpandedHandler()}
            >
              <ChevronDownIcon
                className={cn(
                  'size-4 shrink-0 transition-transform',
                  row.getIsExpanded() ? 'rotate-0' : '-rotate-90',
                )}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{groupLabel(row)}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {taskCountLabel(leafCount(row))}
              </span>
            </button>
          );
        }

        const item = row.original;
        return (
          <Item
            key={row.id}
            variant="outline"
            className="items-start"
            style={{ marginInlineStart: row.depth * 12 }}
          >
            <ItemHeader className="gap-3">
              <ItemContent className="min-w-0">
                {showTask ? <ItemTitle>{item.activityLabel}</ItemTitle> : null}
              </ItemContent>
              {showStatus ? (
                <span
                  className={cn(
                    'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                    item.status.className,
                  )}
                >
                  {item.status.label}
                </span>
              ) : null}
            </ItemHeader>
            {detailIds.length > 0 ? (
              <dl className="mt-1 grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1 border-t border-border/60 pt-2.5 text-sm">
                {detailIds.map((columnId) => (
                  <div key={columnId} className="contents">
                    <dt className="text-muted-foreground">{MOBILE_LABELS[columnId]}</dt>
                    <dd className="min-w-0 break-words">
                      <MobileDetail columnId={columnId} item={item} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Item>
        );
      })}
    </div>
  );
}

export function TaskList({
  tasks,
  isPending,
  isError,
  error,
  showOfficer = true,
  searchPlaceholder = 'Search by task, field, farmer, officer...',
}: {
  tasks: FieldTask[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  showOfficer?: boolean;
  searchPlaceholder?: string;
}) {
  const farmersQuery = useFarmers();
  const items = useMemo(() => {
    const farmerNames = new Map(
      (farmersQuery.data ?? []).map((farmer) => [farmer.id, farmer.name]),
    );
    return (tasks ?? []).map((task) => toTaskListItem(task, farmerNames));
  }, [farmersQuery.data, tasks]);
  const table = useTasksTable({ data: items, showOfficer });
  const [isExporting, setIsExporting] = useState(false);
  const search = typeof table.state.globalFilter === 'string' ? table.state.globalFilter : '';
  const leafCount = table
    .getFilteredRowModel()
    .flatRows.filter((row) => !row.getIsGrouped()).length;
  const { pageIndex, pageSize } = table.state.pagination;
  const grouped = table.state.grouping.length > 0;
  const from = leafCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(leafCount, (pageIndex + 1) * pageSize);
  const emptyMessage =
    (tasks?.length ?? 0) === 0 ? 'No tasks yet.' : 'No tasks match these filters.';

  const handlePreviewExcel = () => {
    if (isExporting) return;
    setIsExporting(true);
    void openExcelPreviewInNewTab(() => buildTaskManagerExcelPackage(table))
      .catch((exportError: unknown) => {
        const message =
          exportError instanceof Error
            ? exportError.message
            : 'Failed to open Excel preview. Please try again.';
        toast.error(message, { position: 'top-center' });
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  const handleDownloadExcel = () => {
    if (isExporting) return;
    setIsExporting(true);
    void exportTaskManagerExcel(table)
      .then(() => {
        toast.success('Excel downloaded', { position: 'top-center' });
      })
      .catch((exportError: unknown) => {
        const message =
          exportError instanceof Error
            ? exportError.message
            : 'Failed to export Excel. Please try again.';
        toast.error(message, { position: 'top-center' });
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          value={search}
          inputMode="search"
          placeholder={searchPlaceholder}
          className="min-h-11 min-w-0 flex-1 sm:min-h-9"
          onChange={(event) => {
            table.setGlobalFilter(event.target.value);
            table.setPageIndex(0);
          }}
        />
        <TaskViewFiltersSheet table={table} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 shrink-0 sm:min-h-8"
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
          className="min-h-11 shrink-0 sm:min-h-8"
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

      {isPending ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, "Couldn't load field tasks.")}
        </p>
      ) : null}

      {!isPending && !isError && leafCount === 0 ? (
        <p className="rounded-lg border px-3 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}

      {!isPending && !isError && leafCount > 0 ? (
        <>
          <TaskTableView table={table} />
          <TaskItemList table={table} />
        </>
      ) : null}

      {!isPending && !isError ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {leafCount === 0
              ? 'Showing 0 of 0 tasks'
              : grouped
                ? `${leafCount.toLocaleString('en-IN')} tasks (grouped)`
                : `Showing ${from.toLocaleString('en-IN')}–${to.toLocaleString('en-IN')} of ${leafCount.toLocaleString('en-IN')} tasks`}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 sm:min-h-8"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 sm:min-h-8"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TaskManagerPage() {
  const tasksQuery = useFieldTasks();

  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Task Manager</CardTitle>
        <CardDescription className="hidden sm:block">
          Track field tasks across plantations. Use view filters and grouping to explore the list.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent>
        <TaskList
          tasks={tasksQuery.data}
          isPending={tasksQuery.isPending}
          isError={tasksQuery.isError}
          error={tasksQuery.error}
        />
      </PageCardContent>
    </PageCard>
  );
}
