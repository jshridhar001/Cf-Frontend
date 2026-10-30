import { type SortingState, useTable } from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  farmersReportColumns,
  farmersReportNumericColumnIds,
} from '@/features/farmers/report/components/farmers-report-columns';
import type { FarmerReportRequisition } from '@/features/farmers/report/types';
import {
  ariaSortValue,
  MasterTableSortHeader,
} from '@/features/master/components/master-table-sort-header';
import { masterTableFeatures } from '@/features/master/lib/master-table-features';
import { cn } from '@/lib/utils';

export function FarmersReportTable({ data }: { data: FarmerReportRequisition[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useTable({
    features: masterTableFeatures,
    data,
    columns: farmersReportColumns,
    getRowId: (row) => row.requisitionId,
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                if (header.rowSpan === 0) return null;

                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const isGroup = header.colSpan > 1;

                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    rowSpan={header.rowSpan}
                    className={cn(
                      'font-semibold',
                      isGroup && 'text-center',
                      farmersReportNumericColumnIds.has(header.column.id) && 'text-right',
                    )}
                    aria-sort={canSort ? ariaSortValue(sorted) : undefined}
                  >
                    <MasterTableSortHeader
                      canSort={canSort}
                      sorted={sorted}
                      onToggle={header.column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                    </MasterTableSortHeader>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    farmersReportNumericColumnIds.has(cell.column.id) && 'text-right',
                    cell.column.id === 'dispatchedSizes' && 'whitespace-normal',
                  )}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
