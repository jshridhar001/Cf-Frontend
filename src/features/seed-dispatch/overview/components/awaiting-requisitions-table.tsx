import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UiTable,
} from '@/components/ui/table';
import {
  ariaSortValue,
  MasterTableSortHeader,
} from '@/features/master/components/master-table-sort-header';
import type { AwaitingRequisitionsTable as AwaitingTable } from '@/features/seed-dispatch/overview/components/use-awaiting-requisitions-table';

export function AwaitingRequisitionsTable({ table }: { table: AwaitingTable }) {
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
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
