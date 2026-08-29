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
import type { AuthUser, Role } from '@/features/auth/types';
import type { UsersTableFeatures } from './users-table-features';

export type UsersTableRow = AuthUser;

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
        <Button variant="ghost" size="icon-sm" className="size-8">
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

export const users: UsersTableRow[] = [
  {
    id: 'usr_01hmdirector',
    name: 'Ananya Rao',
    email: 'ananya.rao@coldop.in',
    emailVerified: true,
    image: null,
    createdAt: '2024-04-12T09:15:00.000Z',
    updatedAt: '2026-08-01T11:20:00.000Z',
    role: 'MANAGING_DIRECTOR',
    banned: false,
    banReason: null,
    banExpires: null,
  },
  {
    id: 'usr_02superdev',
    name: 'Dhairya Sehgal',
    email: 'dhairya@coldop.in',
    emailVerified: true,
    image: null,
    createdAt: '2024-01-08T06:40:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z',
    role: 'SUPER_DEVELOPER',
    banned: false,
    banReason: null,
    banExpires: null,
  },
  {
    id: 'usr_03programme',
    name: 'Meera Iyer',
    email: 'meera.iyer@coldop.in',
    emailVerified: true,
    image: null,
    createdAt: '2024-06-21T10:00:00.000Z',
    updatedAt: '2026-07-15T14:12:00.000Z',
    role: 'PROGRAMME_MANAGER',
    banned: false,
    banReason: null,
    banExpires: null,
  },
  {
    id: 'usr_04field',
    name: 'Rohit Kulkarni',
    email: 'rohit.kulkarni@coldop.in',
    emailVerified: true,
    image: null,
    createdAt: '2025-02-03T07:30:00.000Z',
    updatedAt: '2026-08-18T09:45:00.000Z',
    role: 'FIELD_OFFICER',
    banned: false,
    banReason: null,
    banExpires: null,
  },
  {
    id: 'usr_05unverified',
    name: 'Priya Nair',
    email: 'priya.nair@coldop.in',
    emailVerified: false,
    image: null,
    createdAt: '2026-03-11T12:00:00.000Z',
    updatedAt: '2026-03-11T12:00:00.000Z',
    role: 'FIELD_OFFICER',
    banned: false,
    banReason: null,
    banExpires: null,
  },
  {
    id: 'usr_06banned',
    name: 'Sanjay Patel',
    email: 'sanjay.patel@coldop.in',
    emailVerified: true,
    image: null,
    createdAt: '2024-11-19T05:20:00.000Z',
    updatedAt: '2026-05-02T16:00:00.000Z',
    role: 'FIELD_OFFICER',
    banned: true,
    banReason: 'Policy violation',
    banExpires: null,
  },
  {
    id: 'usr_07pm2',
    name: 'Kabir Menon',
    email: 'kabir.menon@coldop.in',
    emailVerified: true,
    image: null,
    createdAt: '2025-08-14T08:10:00.000Z',
    updatedAt: '2026-08-10T10:30:00.000Z',
    role: 'PROGRAMME_MANAGER',
    banned: false,
    banReason: null,
    banExpires: null,
  },
  {
    id: 'usr_08field2',
    name: 'Lakshmi Reddy',
    email: 'lakshmi.reddy@coldop.in',
    emailVerified: true,
    image: null,
    createdAt: '2025-10-02T04:55:00.000Z',
    updatedAt: '2026-08-22T07:18:00.000Z',
    role: 'FIELD_OFFICER',
    banned: false,
    banReason: null,
    banExpires: null,
  },
  {
    id: 'usr_09dev2',
    name: 'Arjun Shah',
    email: 'arjun.shah@coldop.in',
    emailVerified: false,
    image: null,
    createdAt: '2026-01-27T13:40:00.000Z',
    updatedAt: '2026-06-01T09:00:00.000Z',
    role: 'SUPER_DEVELOPER',
    banned: false,
    banReason: null,
    banExpires: null,
  },
  {
    id: 'usr_10field3',
    name: 'Neha Joshi',
    email: 'neha.joshi@coldop.in',
    emailVerified: true,
    image: null,
    createdAt: '2025-05-09T11:25:00.000Z',
    updatedAt: '2026-08-05T15:50:00.000Z',
    role: 'FIELD_OFFICER',
    banned: false,
    banReason: null,
    banExpires: null,
  },
];
