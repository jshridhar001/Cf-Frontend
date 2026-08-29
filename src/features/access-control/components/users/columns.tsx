import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontalIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Role } from '@/features/auth/types';
import type { AccessControlUser } from '@/features/types';
import type { UsersTableFeatures } from './users-table-features';

export type UsersTableRow = AccessControlUser;

export const USER_ROLES = [
  'MANAGING_DIRECTOR',
  'SUPER_DEVELOPER',
  'PROGRAMME_MANAGER',
  'FIELD_OFFICER',
] as const satisfies readonly Role[];

export function formatRoleLabel(role: string) {
  return role
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function roleBadgeVariant(role: string) {
  switch (role) {
    case 'MANAGING_DIRECTOR':
      return 'default' as const;
    case 'SUPER_DEVELOPER':
      return 'secondary' as const;
    case 'PROGRAMME_MANAGER':
      return 'outline' as const;
    default:
      return 'ghost' as const;
  }
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge variant={roleBadgeVariant(role)}>{formatRoleLabel(role)}</Badge>;
}

export function UserIdentity({ user }: { user: UsersTableRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="sm">
        {user.image ? <AvatarImage alt="" src={user.image} /> : null}
        <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="truncate font-medium">{user.name}</div>
    </div>
  );
}

export function UserRowActions({ user }: { user: UsersTableRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 min-h-11 min-w-11 md:min-h-8 md:min-w-8"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel className="font-semibold tracking-wide text-muted-foreground uppercase">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.info(`Edit ${user.name} coming soon.`)}>
          <SquarePenIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => toast.info(`Delete ${user.name} coming soon.`)}
        >
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

const columnHelper = createColumnHelper<UsersTableFeatures, UsersTableRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Name',
    cell: ({ row }) => <UserIdentity user={row.original} />,
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
    filterFn: 'includesString',
    sortFn: 'text',
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created At',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatCreatedAt(row.original.createdAt)}
      </span>
    ),
    sortFn: 'alphanumeric',
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserRowActions user={row.original} />
      </div>
    ),
    enableSorting: false,
  }),
]);
