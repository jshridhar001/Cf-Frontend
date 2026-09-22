import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import * as React from 'react';
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
  ADDRESS_LEVEL_CONFIG,
  type AddressLevel,
  getAddressParentName,
  getAddressPath,
  getAddressPincode,
} from '@/features/master/lib/address-levels';
import { formatCreatedAt } from '@/features/master/lib/format-created-at';
import {
  type MasterTableFeatures,
  masterTableFeatures,
} from '@/features/master/lib/master-table-features';
import { type AddressTableMeta, type AddressTableRow } from './address-entity-table-column';

interface AddressEntityTableProps<TData extends RowData> {
  level: AddressLevel;
  columns: ColumnDef<MasterTableFeatures, TData>[];
  data: TData[];
  filterSlot?: ReactNode;
  onAdd?: () => void;
  onDeleteAll?: () => void;
  deleteAllDisabled?: boolean;
  onEdit?: (entity: AddressTableRow) => void;
  onDelete?: (entity: AddressTableRow) => void;
}

export function AddressEntityTable<TData extends RowData>({
  level,
  columns,
  data,
  filterSlot,
  onAdd,
  onDeleteAll,
  deleteAllDisabled,
  onEdit,
  onDelete,
}: AddressEntityTableProps<TData>) {
  const config = ADDRESS_LEVEL_CONFIG[level];
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
    } satisfies AddressTableMeta,
    state: {
      sorting,
      columnFilters,
    },
  });

  const nameFilter = (table.getColumn('name')?.getFilterValue() as string | undefined) ?? '';

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={`Filter ${config.label.toLowerCase()}…`}
            value={nameFilter}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          />
        </InputGroup>
        {filterSlot}
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
            Add {config.singular}
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
            const entity = row.original as AddressTableRow;
            const parentName = getAddressParentName(level, entity);
            const pincode = getAddressPincode(entity);
            const path = config.showPath ? getAddressPath(entity) : null;
            const details = [pincode, parentName, path].filter(Boolean).join(' · ');

            return (
              <Item key={row.id} variant="outline" size="sm" className="items-start">
                <ItemHeader className="gap-3">
                  <ItemContent className="min-w-0 pr-1">
                    <ItemTitle>{entity.name}</ItemTitle>
                    <ItemDescription>
                      {details || formatCreatedAt(entity.createdAt)}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="shrink-0 self-start">
                    <MasterRowActions
                      onEdit={() => onEdit?.(entity)}
                      onDelete={() => onDelete?.(entity)}
                    />
                  </ItemActions>
                </ItemHeader>
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
