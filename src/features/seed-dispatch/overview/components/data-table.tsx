import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UiTable,
} from '@/components/ui/table';
import type { DispatchesTable } from '@/features/seed-dispatch/overview/components/use-dispatches-table';
import {
  ariaSortValue,
  MasterTableSortHeader,
} from '@/features/master/components/master-table-sort-header';
import { cn } from '@/lib/utils';

const SUM_AGGREGATED_COLUMN_IDS = new Set(['netWeight']);

export function DataTable({ table }: { table: DispatchesTable }) {
  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;

  return (
    <div className="overflow-hidden rounded-2xl border">
      <UiTable>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();

                return (
                  <TableHead
                    key={header.id}
                    className="font-semibold"
                    aria-sort={canSort ? ariaSortValue(sorted) : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <MasterTableSortHeader
                        canSort={canSort}
                        sorted={sorted}
                        onToggle={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                      </MasterTableSortHeader>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  row.getIsGrouped() &&
                    'bg-muted/70 hover:bg-muted/80 shadow-[inset_3px_0_0_0] shadow-primary/35',
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  if (cell.getIsPlaceholder()) {
                    return <TableCell key={cell.id} />;
                  }

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
                            <table.FlexRender cell={cell} />
                          </span>
                        </div>
                      </TableCell>
                    );
                  }

                  if (row.getIsGrouped()) {
                    if (!SUM_AGGREGATED_COLUMN_IDS.has(cell.column.id)) {
                      return <TableCell key={cell.id} />;
                    }
                    return (
                      <TableCell key={cell.id} className="font-semibold tabular-nums">
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UiTable>
    </div>
  );
}
