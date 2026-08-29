import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { SearchIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
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
  type UsersTableRow,
} from './columns';
import { type UsersTableFeatures, usersTableFeatures } from './users-table-features';

interface UsersTableProps<TData extends RowData> {
  columns: ColumnDef<UsersTableFeatures, TData>[];
  data: TData[];
}

export function UsersTable<TData extends RowData>({ columns, data }: UsersTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useTable({
    features: usersTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
          <Button type="button" variant="destructive" size="sm">
            <Trash2Icon data-icon="inline-start" />
            Delete All
          </Button>
          <Button type="button" size="sm">
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
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
              <Item key={row.id} variant="outline" size="sm">
                <ItemMedia>
                  <Avatar size="sm">
                    {user.image ? <AvatarImage alt="" src={user.image} /> : null}
                    <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{user.name}</ItemTitle>
                  <ItemDescription className="line-clamp-1">{user.email}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <UserRowActions user={user} />
                </ItemActions>
                <ItemFooter>
                  <RoleBadge role={user.role} />
                  <span className="text-sm text-muted-foreground">
                    {formatCreatedAt(user.createdAt)}
                  </span>
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
