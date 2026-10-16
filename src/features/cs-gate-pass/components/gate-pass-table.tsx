import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item';
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
  type MasterTableFeatures,
  masterTableFeatures,
} from '@/features/master/lib/master-table-features';
import type { ColdStorageGatePass } from '../types';
import { type GatePassTableMeta } from './gate-pass-table-column';

interface GatePassTableProps<TData extends RowData> {
  columns: ColumnDef<MasterTableFeatures, TData>[];
  data: TData[];
  onAdd?: () => void;
  onEdit?: (gatePass: ColdStorageGatePass) => void;
  onNullify?: (gatePass: ColdStorageGatePass) => void;
  onDelete?: (gatePass: ColdStorageGatePass) => void;
}

function formatGatePassDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'd MMM yyyy');
}

export function GatePassTable<TData extends RowData>({
  columns,
  data,
  onAdd,
  onEdit,
  onNullify,
  onDelete,
}: GatePassTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useTable({
    features: masterTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    meta: {
      onEdit,
      onNullify,
      onDelete,
    } satisfies GatePassTableMeta,
    state: {
      sorting,
      columnFilters,
    },
  });

  const coldStorageFilter =
    (table.getColumn('coldStorageName')?.getFilterValue() as string | undefined) ?? '';

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Filter cold storages…"
            value={coldStorageFilter}
            onChange={(event) =>
              table.getColumn('coldStorageName')?.setFilterValue(event.target.value)
            }
          />
        </InputGroup>
        <div className="hidden items-center gap-2 sm:ml-auto md:flex">
          <Button type="button" size="sm" onClick={onAdd}>
            <PlusIcon data-icon="inline-start" />
            Add gate pass
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
                  No gate passes yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ItemGroup className="md:hidden">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const gatePass = row.original as ColdStorageGatePass;
            return (
              <Item key={row.id} variant="outline" size="sm" className="items-start">
                <ItemHeader className="gap-3">
                  <ItemContent className="min-w-0 pr-1">
                    <ItemTitle>{gatePass.facility.name}</ItemTitle>
                    <ItemDescription>
                      {formatGatePassDate(gatePass.gatePassDate)} · {gatePass.variety.name} ·{' '}
                      {gatePass.generation.name} · {gatePass.size.name} · {gatePass.quantity} ·{' '}
                      {gatePass.status === 'NULL' ? 'Null' : 'Active'}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="shrink-0 self-start">
                    <MasterRowActions
                      onEdit={gatePass.status === 'ACTIVE' ? () => onEdit?.(gatePass) : undefined}
                      onNullify={
                        gatePass.status === 'ACTIVE' ? () => onNullify?.(gatePass) : undefined
                      }
                      onDelete={() => onDelete?.(gatePass)}
                    />
                  </ItemActions>
                </ItemHeader>
              </Item>
            );
          })
        ) : (
          <div className="rounded-2xl border px-3 py-8 text-center text-sm text-muted-foreground">
            No gate passes yet.
          </div>
        )}
      </ItemGroup>
    </div>
  );
}
