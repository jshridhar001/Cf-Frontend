import { Trash2Icon, UserPlusIcon } from 'lucide-react';
import { useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { useUsers } from '@/features/access-control/api/use-users';
import type { AccessControlUser } from '@/features/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { columns } from './columns';
import { CreateUserDrawer } from './create-user-drawer';
import { DeleteAllUsersDialog } from './delete-all-users-dialog';
import { DeleteUserDialog } from './delete-user-dialog';
import { EditUserDrawer } from './edit-user-drawer';
import { UsersTable } from './users-table';

interface UsersTabContentProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function UsersTabContent({ createOpen, onCreateOpenChange }: UsersTabContentProps) {
  const { data: users, isPending, isError, error } = useUsers();
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AccessControlUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AccessControlUser | null>(null);
  const userIds = users?.map((user) => user.id) ?? [];
  const canDeleteAll = userIds.length > 0;

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto] md:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>Users</CardTitle>
        <CardDescription className="hidden sm:block">
          Manage user accounts and roles. Invite new users and control who can access the platform.
        </CardDescription>
        <CardAction className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Delete all users"
            disabled={!canDeleteAll}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2Icon />
          </Button>
          <Button
            type="button"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Add user"
            onClick={() => onCreateOpenChange(true)}
          >
            <UserPlusIcon />
          </Button>
        </CardAction>
      </PageCardHeader>
      <PageCardContent>
        {isPending && users === undefined ? (
          <p className="text-sm text-muted-foreground">Loading users…</p>
        ) : null}

        {isError && users === undefined ? (
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        ) : null}

        {users !== undefined ? (
          <UsersTable
            columns={columns}
            data={users}
            onAddUser={() => onCreateOpenChange(true)}
            onDeleteAll={() => setDeleteAllOpen(true)}
            deleteAllDisabled={!canDeleteAll}
            onEditUser={setEditingUser}
            onDeleteUser={setDeletingUser}
          />
        ) : null}
      </PageCardContent>
      <CreateUserDrawer open={createOpen} onOpenChange={onCreateOpenChange} />
      <EditUserDrawer
        user={editingUser}
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      />
      <DeleteUserDialog
        user={deletingUser}
        open={deletingUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
      />
      <DeleteAllUsersDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        userIds={userIds}
      />
    </PageCard>
  );
}
