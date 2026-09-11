import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type ColumnDef,
  flexRender,
  type HeaderGroup,
  type Row,
  type RowData,
  type Table as TanStackTable,
} from '@/features/seed-requisition/report/lib/react-table';
import type { ColumnMeta } from '@/features/seed-requisition/report/types';
import { cn } from '@/lib/utils';

const TABLE_GRID_CLASS = cn(
  'border-collapse',
  '[&_th]:border-b [&_th]:border-r [&_td]:border-b [&_td]:border-r',
  '[&_th]:border-border/50 [&_td]:border-border/30',
  '[&_th:first-child]:border-l-0 [&_td:first-child]:border-l-0',
  '[&_thead_th]:border-t-0 [&_thead_th]:border-b-2 [&_thead_th]:border-b-border/60',
  '[&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0',
);

type SeedRequisitionDataTableProps<TData extends RowData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  table: TanStackTable<TData>;
  rows: Row<TData>[];
  headerGroups: HeaderGroup<TData>[];
  filteredCount: number;
  pageIndex: number;
  pageSize: number;
  isGrouped: boolean;
  emptyTitle?: string;
  entityLabel?: string;
};

export function SeedRequisitionDataTable<TData extends RowData, TValue>({
  columns,
  table,
  rows,
  headerGroups,
  filteredCount,
  pageIndex,
  pageSize,
  isGrouped,
  emptyTitle = 'No requisitions found.',
  entityLabel = 'requisitions',
}: SeedRequisitionDataTableProps<TData, TValue>) {
  const hasRows = rows.length > 0;
  const rangeStart = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsHeaderScrolled(el.scrollTop > 0);
  }, []);

  useEffect(() => {
    handleTableScroll();
  }, [handleTableScroll]);

  return (
    <div>
      <div
        ref={scrollContainerRef}
        onScroll={handleTableScroll}
        className="max-h-[min(70vh,42rem)] overflow-auto rounded-md border"
      >
        <Table className={TABLE_GRID_CLASS}>
          <TableHeader
            className={cn(
              'sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent',
              isHeaderScrolled && 'shadow-[0_1px_0_0] shadow-border/80',
            )}
          >
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={meta?.width ? { width: meta.width } : undefined}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={cn(
                        'group/head px-4 py-3 align-middle transition-[padding,background-color,color] duration-200',
                        isHeaderScrolled
                          ? 'bg-muted text-foreground supports-backdrop-filter:bg-muted/95 backdrop-blur-sm'
                          : 'bg-muted text-foreground',
                        canSort && 'cursor-pointer select-none hover:bg-muted/90',
                        meta?.headerClassName,
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {canSort ? (
                            <span className="shrink-0 transition-opacity">
                              {sorted === 'asc' ? (
                                <ArrowUp className="size-4 text-foreground" />
                              ) : sorted === 'desc' ? (
                                <ArrowDown className="size-4 text-foreground" />
                              ) : (
                                <ChevronsUpDown className="size-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover/head:opacity-100" />
                              )}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0">
            {hasRows ? (
              rows.map((row) => {
                const isGroupedRow = row.getIsGrouped();

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'border-0 transition-colors hover:bg-muted/30',
                      isGroupedRow && 'bg-muted/40 hover:bg-muted/50',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as ColumnMeta | undefined;

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'px-4 py-3.5 align-middle text-sm transition-[padding] duration-200',
                            meta?.cellClassName,
                            isGroupedRow && 'bg-transparent',
                          )}
                        >
                          {cell.getIsGrouped() ? (
                            <button
                              type="button"
                              className="flex min-w-0 items-center gap-2 rounded-md text-left text-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
                              style={{
                                paddingLeft: `${row.depth * 0.75}rem`,
                                cursor: row.getCanExpand() ? 'pointer' : 'default',
                              }}
                              onClick={row.getToggleExpandedHandler()}
                              aria-expanded={row.getIsExpanded()}
                            >
                              {row.getCanExpand() ? (
                                row.getIsExpanded() ? (
                                  <ChevronDown
                                    className="size-4 shrink-0 text-primary"
                                    aria-hidden
                                  />
                                ) : (
                                  <ChevronRight
                                    className="size-4 shrink-0 text-primary"
                                    aria-hidden
                                  />
                                )
                              ) : null}
                              <span className="min-w-0 truncate text-foreground">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </span>
                              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">
                                {row.subRows.length.toLocaleString('en-IN')}
                              </span>
                            </button>
                          ) : cell.getIsAggregated() ? (
                            flexRender(
                              cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                              cell.getContext(),
                            )
                          ) : cell.getIsPlaceholder() ? null : (
                            <span
                              className={cn(
                                'block min-w-0 text-foreground',
                                !meta?.cellClassName?.includes('whitespace-normal') && 'truncate',
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 border-0 text-center text-sm text-muted-foreground"
                >
                  {emptyTitle}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasRows ? (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground tabular-nums">
              {rangeStart}–{rangeEnd}
            </span>{' '}
            of <span className="font-medium text-foreground tabular-nums">{filteredCount}</span>{' '}
            {entityLabel}
            {isGrouped ? ' (grouped)' : ''}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
