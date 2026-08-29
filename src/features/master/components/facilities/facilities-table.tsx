import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MasterRowActions } from '@/features/master/components/master-row-actions';
import {
  ariaSortValue,
  MasterTableSortHeader,
} from '@/features/master/components/master-table-sort-header';
import {
  FACILITY_USED_IN_OPTIONS,
  getFacilityUsedInLabel,
} from '@/features/master/lib/facility-used-in';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';
import {
  type MasterTableFeatures,
  masterTableFeatures,
} from '@/features/master/lib/master-table-features';
import { type FacilitiesTableMeta, type FacilitiesTableRow } from './facility-table-column';

interface FacilitiesTableProps<TData extends RowData> {
  columns: ColumnDef<MasterTableFeatures, TData>[];
  data: TData[];
  onAdd?: () => void;
  onDeleteAll?: () => void;
  deleteAllDisabled?: boolean;
  onEdit?: (facility: FacilitiesTableRow) => void;
  onDelete?: (facility: FacilitiesTableRow) => void;
}

export function FacilitiesTable<TData extends RowData>({
  columns,
  data,
  onAdd,
  onDeleteAll,
  deleteAllDisabled,
  onEdit,
  onDelete,
}: FacilitiesTableProps<TData>) {
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
    } satisfies FacilitiesTableMeta,
    state: {
      sorting,
      columnFilters,
    },
  });

  const nameFilter = (table.getColumn('name')?.getFilterValue() as string | undefined) ?? '';
  const usedInFilter = (table.getColumn('usedIn')?.getFilterValue() as string | undefined) ?? 'all';

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Filter facilities…"
            value={nameFilter}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          />
        </InputGroup>
        <Select
          value={usedInFilter}
          onValueChange={(value) =>
            table.getColumn('usedIn')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger size="default" className="h-9 w-full sm:h-8 sm:w-48">
            <SelectValue placeholder="All uses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All uses</SelectItem>
            {FACILITY_USED_IN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="hidden items-center gap-2 sm:ml-auto md:flex">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteAllDisabled}
            onClick={onDeleteAll}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete All
          </Button>
          <Button type="button" size="sm" onClick={onAdd}>
            <PlusIcon data-icon="inline-start" />
            Add Facility
          </Button>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border md:block">
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

      <ItemGroup className="md:hidden">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const facility = row.original as FacilitiesTableRow;
            return (
              <Item key={row.id} variant="outline" size="sm" className="items-start">
                <ItemHeader className="gap-3">
                  <ItemContent className="min-w-0 pr-1">
                    <ItemTitle>{facility.name}</ItemTitle>
                    <ItemDescription>
                      {getFacilityUsedInLabel(facility.usedIn)} · {facility.totalBagsDispatched}{' '}
                      bags dispatched
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="shrink-0 self-start">
                    <MasterRowActions
                      onEdit={() => onEdit?.(facility)}
                      onDelete={() => onDelete?.(facility)}
                    />
                  </ItemActions>
                </ItemHeader>
                <ItemFooter className="mt-1 border-t border-border/60 pt-2.5">
                  <time dateTime={facility.createdAt} className="text-xs text-muted-foreground">
                    {formatCreatedAt(facility.createdAt)}
                  </time>
                </ItemFooter>
              </Item>
            );
          })
        ) : (
          <div className="rounded-2xl border px-3 py-8 text-center text-sm text-muted-foreground">
            No results.
          </div>
        )}
      </ItemGroup>
    </div>
  );
}
