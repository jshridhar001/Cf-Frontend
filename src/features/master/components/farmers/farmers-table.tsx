import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { SearchIcon } from 'lucide-react';
import * as React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ariaSortValue,
  MasterTableSortHeader,
} from '@/features/master/components/master-table-sort-header';
import {
  type MasterTableFeatures,
  masterTableFeatures,
} from '@/features/master/lib/master-table-features';
import { type FarmersTableMeta, type FarmersTableRow } from './farmers-table-column';

interface FarmersTableProps<TData extends RowData> {
  columns: ColumnDef<MasterTableFeatures, TData>[];
  data: TData[];
  onEdit?: (farmer: FarmersTableRow) => void;
  onDelete?: (farmer: FarmersTableRow) => void;
}

export function FarmersTable<TData extends RowData>({
  columns,
  data,
  onEdit,
  onDelete,
}: FarmersTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useTable({
    features: masterTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    meta: {
      onEdit,
      onDelete,
    } satisfies FarmersTableMeta,
    state: {
      sorting,
      columnFilters,
    },
  });

  const nameFilter = (table.getColumn('name')?.getFilterValue() as string | undefined) ?? '';

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Filter farmers…"
          value={nameFilter}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
        />
      </InputGroup>

      <div className="overflow-x-auto overflow-y-hidden rounded-2xl border">
        <Table>
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
