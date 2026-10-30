import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnVisibilityState,
  type ExpandedState,
  type GroupingState,
  type Row,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { contractColumns } from '@/features/farmers/report/components/contract-columns';
import {
  formatGroupDispatchPercent,
  groupDispatch,
  groupQuantityLines,
} from '@/features/farmers/report/lib/display';
import {
  type ReportTableFeatures,
  reportTableFeatures,
} from '@/features/farmers/report/lib/table-features';
import type { FarmerReportRequisition } from '@/features/farmers/report/types';
import {
  ariaSortValue,
  MasterTableSortHeader,
} from '@/features/master/components/master-table-sort-header';
import { formatFacetLabel } from '@/features/seed-requisition/overview/components/view-filters/helpers';
import { cn } from '@/lib/utils';

const WRAPPING_COLUMN_IDS = new Set(['farmer', 'contractDate']);
const GROUP_QUANTITY_COLUMN_IDS = new Set(['requested', 'dispatched']);

type ReportRow = Row<ReportTableFeatures, FarmerReportRequisition>;

function leafRequisitions(row: ReportRow): FarmerReportRequisition[] {
  return row.getLeafRows().map((leaf) => leaf.original);
}

export function useReportTable(
  data: FarmerReportRequisition[],
  initialGrouping: GroupingState = [],
) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'farmer', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [grouping, setGrouping] = useState<GroupingState>(initialGrouping);
  const [expanded, setExpanded] = useState<ExpandedState>(initialGrouping.length > 0 ? true : {});

  return useTable({
    features: reportTableFeatures,
    data,
    columns: contractColumns,
    getRowId: (row) => row.requisitionId,
    defaultColumn: {
      filterFn: 'selectedValues',
    },
    groupedColumnMode: 'reorder',
    autoResetExpanded: false,
    filterFromLeafRows: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      grouping,
      expanded,
    },
  });
}

export type ReportTable = ReturnType<typeof useReportTable>;

export function ContractTableView({ table }: { table: ReportTable }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();

                return (
                  <TableHead
                    key={header.id}
                    className="font-medium text-muted-foreground"
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
          {table.getRowModel().rows.map((row) => (
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
                    <TableCell key={cell.id} className="align-top whitespace-normal">
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
                          {formatFacetLabel(cell.column, cell.getValue())}
                        </span>
                      </div>
                    </TableCell>
                  );
                }

                if (row.getIsGrouped()) {
                  const leaves = leafRequisitions(row);
                  if (GROUP_QUANTITY_COLUMN_IDS.has(cell.column.id)) {
                    const lines = groupQuantityLines(
                      leaves,
                      cell.column.id === 'requested' ? 'requested' : 'dispatched',
                    );
                    return (
                      <TableCell key={cell.id} className="align-top font-semibold tabular-nums">
                        <div>{lines.primary ?? '—'}</div>
                        {lines.secondary ? (
                          <div className="text-xs font-normal text-muted-foreground">
                            {lines.secondary}
                          </div>
                        ) : null}
                      </TableCell>
                    );
                  }
                  if (cell.column.id === 'progress') {
                    const percent = groupDispatch(leaves).percent;
                    const label = formatGroupDispatchPercent(leaves);
                    return (
                      <TableCell key={cell.id} className="align-top">
                        <div className="flex min-w-28 flex-col gap-1.5">
                          <Progress value={percent} className="h-1.5" aria-label={label} />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {label}
                          </span>
                        </div>
                      </TableCell>
                    );
                  }
                  return <TableCell key={cell.id} />;
                }

                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'align-top',
                      WRAPPING_COLUMN_IDS.has(cell.column.id) && 'whitespace-normal',
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ContractTable({ data }: { data: FarmerReportRequisition[] }) {
  const table = useReportTable(data);
  return <ContractTableView table={table} />;
}
