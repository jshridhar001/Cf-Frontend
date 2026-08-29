import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  SearchIcon,
  Trash2Icon,
  UserPlusIcon,
} from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  ItemMedia,
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
import {
  formatCreatedAt,
  formatRoleLabel,
  getUserInitials,
  RoleBadge,
  USER_ROLES,
  UserRowActions,
  type UsersTableMeta,
  type UsersTableRow,
} from './columns';
import { type UsersTableFeatures, usersTableFeatures } from './users-table-features';

function ariaSortValue(sorted: false | 'asc' | 'desc') {
  if (sorted === 'asc') return 'ascending';
  if (sorted === 'desc') return 'descending';
  return 'none';
}

function UsersTableSortHeader({
  canSort,
  sorted,
  onToggle,
  children,
}: {
  canSort: boolean;
  sorted: false | 'asc' | 'desc';
  onToggle?: (event: unknown) => void;
  children: React.ReactNode;
}) {
  if (!canSort) {
    return children;
  }

  const SortIcon =
    sorted === 'asc' ? ArrowUpIcon : sorted === 'desc' ? ArrowDownIcon : ChevronsUpDownIcon;

  return (
    <button
      type="button"
      className="group inline-flex cursor-pointer items-center gap-1.5 rounded-md text-left font-semibold outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      onClick={onToggle}
    >
      {children}
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        <SortIcon
          aria-hidden
          className={
            sorted
              ? 'size-3.5 text-foreground'
              : 'size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground'
          }
        />
      </span>
    </button>
  );
}

interface UsersTableProps<TData extends RowData> {
  columns: ColumnDef<UsersTableFeatures, TData>[];
  data: TData[];
  onAddUser?: () => void;
  onDeleteAll?: () => void;
  deleteAllDisabled?: boolean;
  onEditUser?: (user: UsersTableRow) => void;
  onDeleteUser?: (user: UsersTableRow) => void;
}

export function UsersTable<TData extends RowData>({
  columns,
  data,
  onAddUser,
  onDeleteAll,
  deleteAllDisabled,
  onEditUser,
  onDeleteUser,
}: UsersTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useTable({
    features: usersTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    meta: {
      onEditUser,
      onDeleteUser,
    } satisfies UsersTableMeta,
    state: {
      sorting,
      columnFilters,
    },
  });

  const roleFilter = (table.getColumn('role')?.getFilterValue() as string | undefined) ?? 'all';
  const nameFilter = (table.getColumn('name')?.getFilterValue() as string | undefined) ?? '';

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Filter users…"
            value={nameFilter}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          />
        </InputGroup>
        <Select
          value={roleFilter}
          onValueChange={(value) =>
            table.getColumn('role')?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger size="default" className="h-9 w-full sm:h-8 sm:w-48">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {USER_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {formatRoleLabel(role)}
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
          <Button type="button" size="sm" onClick={onAddUser}>
            <UserPlusIcon data-icon="inline-start" />
            Add User
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
                        <UsersTableSortHeader
                          canSort={canSort}
                          sorted={sorted}
                          onToggle={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                        </UsersTableSortHeader>
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
            const user = row.original as UsersTableRow;
            return (
              <Item key={row.id} variant="outline" size="sm" className="items-start">
                <ItemHeader className="gap-3">
                  <ItemMedia>
                    <Avatar size="sm">
                      {user.image ? <AvatarImage alt="" src={user.image} /> : null}
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="min-w-0 pr-1">
                    <ItemTitle>{user.name}</ItemTitle>
                    <ItemDescription className="line-clamp-2 break-all">
                      {user.email}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="shrink-0 self-start">
                    <UserRowActions user={user} onEdit={onEditUser} onDelete={onDeleteUser} />
                  </ItemActions>
                </ItemHeader>
                <ItemFooter className="mt-1 flex-col items-start gap-1.5 border-t border-border/60 pt-2.5">
                  <RoleBadge
                    role={user.role}
                    className="h-auto max-w-full whitespace-normal text-left leading-snug"
                  />
                  <time dateTime={user.createdAt} className="px-2 text-xs text-muted-foreground">
                    {formatCreatedAt(user.createdAt)}
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
